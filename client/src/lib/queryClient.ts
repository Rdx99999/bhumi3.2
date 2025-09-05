import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  authenticate: boolean = false,
): Promise<Response> {
  // Set up headers
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Add API authentication code if required
  if (authenticate) {
    headers["X-API-Code"] = import.meta.env.VITE_API_CODE;
    // Add cache-busting query parameter for authenticated requests
    if (url.includes('?')) {
      url = `${url}&_t=${Date.now()}`;
    } else {
      url = `${url}?_t=${Date.now()}`;
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  authenticate?: boolean;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, authenticate = false }) =>
  async ({ queryKey }) => {
    // Set up headers for authentication if needed
    const headers: Record<string, string> = {};
    
    if (authenticate) {
      headers["X-API-Code"] = import.meta.env.VITE_API_CODE;
    }
    
    let endpoint = queryKey[0] as string;
    
    // Add cache-busting parameter for authenticated requests
    if (authenticate) {
      if (endpoint.includes('?')) {
        endpoint = `${endpoint}&_t=${Date.now()}`;
      } else {
        endpoint = `${endpoint}?_t=${Date.now()}`;
      }
    }
    
    const res = await fetch(endpoint, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
