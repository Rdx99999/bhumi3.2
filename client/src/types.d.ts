// Type definitions for the Bhumi Consultancy website

// Extend the Window interface to include our routeCache
interface Window {
  routeCache?: {
    currentPath: string;
  };
}