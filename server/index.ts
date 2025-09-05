import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fetch from "node-fetch";

const app = express();

// Ping function to keep the server alive
const PING_URL = process.env.DOMAIN || "https://bhumiconsultancy.in";
const PING_INTERVAL = 25000; // 25 seconds

async function pingWebsite() {
  try {
    const response = await fetch(PING_URL, {
      method: 'GET',
      timeout: 10000, // 10 second timeout
    });
    log(`Ping to ${PING_URL}: ${response.status} ${response.statusText}`, "ping");
  } catch (error) {
    log(`Ping failed to ${PING_URL}: ${error.message}`, "ping");
  }
}

// Start pinging after server is ready
function startPingService() {
  log(`Starting ping service - will ping ${PING_URL} every ${PING_INTERVAL/1000} seconds`, "ping");
  setInterval(pingWebsite, PING_INTERVAL);
  // Initial ping after 30 seconds
  setTimeout(pingWebsite, 30000);
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // If the error is a 404 for a non-API path, allow it to pass through to the client router
    if (err.status === 404 && !_req.path.startsWith('/api')) {
      return _next();
    }
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    // Start the ping service to keep the server alive
    startPingService();
  });
})();
