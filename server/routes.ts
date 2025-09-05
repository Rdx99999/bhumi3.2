import "dotenv/config";
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertServiceSchema, 
  insertTrainingProgramSchema,
  insertParticipantSchema,
  insertCertificateSchema,
  contactFormSchema,
  certificateVerificationSchema,
  statusCheckSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";
import { SitemapStream, streamToPromise } from "sitemap";
import { createGzip } from "zlib";
import { sendContactNotification } from "./telegram-notifications";

// Cloudflare Worker URL - force your new URL
const CLOUDFLARE_WORKER_URL = "https://apiv2.bhumiconsultancy120.workers.dev";

// Site domain for sitemap
const DOMAIN = process.env.DOMAIN || "https://bhumiconsultancy.in";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route prefix
  const apiPrefix = "/api";
  
  // Health check endpoint for ping service
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Error handler middleware
  const handleError = (err: unknown, res: Response) => {
    console.error("API Error:", err);
    
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ 
        success: false, 
        error: validationError.message 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error occurred" 
    });
  };
  
  // Add a middleware to set proper caching headers for assets
  app.use((req, res, next) => {
    // Only handle specific static assets that should be cached
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    }
    next();
  });

  // GET services
  app.get(`${apiPrefix}/services`, (req: Request, res: Response) => {
    // Always proxy to Cloudflare Worker API
    proxyToCloudflareWorker(req, res, '/api/services');
  });

  // GET single service
  app.get(`${apiPrefix}/services/:id`, (req: Request, res: Response) => {
    // Always proxy to Cloudflare Worker API
    proxyToCloudflareWorker(req, res, `/api/services/${req.params.id}`);
  });

  // GET training programs
  app.get(`${apiPrefix}/training-programs`, (req: Request, res: Response) => {
    // Always proxy to Cloudflare Worker API
    proxyToCloudflareWorker(req, res, '/api/training-programs');
  });

  // GET single training program
  app.get(`${apiPrefix}/training-programs/:id`, (req: Request, res: Response) => {
    // Always proxy to Cloudflare Worker API
    proxyToCloudflareWorker(req, res, `/api/training-programs/${req.params.id}`);
  });

  // POST verify certificate
  app.post(`${apiPrefix}/verify-certificate`, (req: Request, res: Response) => {
    // Always proxy to Cloudflare Worker API
    proxyToCloudflareWorker(req, res, '/api/verify-certificate');
  });

  // POST check participant status
  app.post(`${apiPrefix}/check-status`, (req: Request, res: Response) => {
    // Always proxy to Cloudflare Worker API
    proxyToCloudflareWorker(req, res, '/api/check-status');
  });

  // POST contact form with Telegram notification
  app.post(`${apiPrefix}/contact`, async (req: Request, res: Response) => {
    try {
      // Validate the contact form data
      const validatedData = contactFormSchema.parse(req.body);
      
      // First, save to database via Cloudflare Worker
      const response = await fetch(`${CLOUDFLARE_WORKER_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      });
      
      const data = await response.json() as any;
      
      // If successful, send Telegram notification immediately
      if (response.ok && data.success) {
        // Send notification in the background (don't wait for it)
        sendContactNotification({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          subject: validatedData.subject,
          message: validatedData.message
        }).catch(error => {
          console.error('Failed to send Telegram notification:', error);
        });
        
        console.log(`📬 New contact from ${validatedData.name} (${validatedData.email}) - Telegram notification sent`);
      }
      
      // Return the response to the client
      return res.status(response.status).json(data);
    } catch (error) {
      // If validation fails or other error, fall back to proxy BUT still try to send notification
      if (error instanceof ZodError) {
        console.log('⚠️ Contact form validation failed, using proxy method');
      } else {
        console.error('Contact form error, falling back to proxy:', error);
      }
      
      // Proxy to Cloudflare Worker with notification wrapper
      await proxyToCloudflareWorkerWithNotification(req, res, '/api/contact');
    }
  });

  // Test endpoint for Telegram notifications
  app.get(`${apiPrefix}/test-telegram`, async (req: Request, res: Response) => {
    try {
      const { testTelegramBot } = await import('./telegram-notifications');
      const result = await testTelegramBot();
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Telegram bot status endpoint
  app.get(`${apiPrefix}/telegram-status`, async (req: Request, res: Response) => {
    try {
      const { getTelegramBotStatus } = await import('./telegram-notifications');
      const status = getTelegramBotStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Special proxy function for contact forms that also sends Telegram notifications
  async function proxyToCloudflareWorkerWithNotification(req: Request, res: Response, endpoint: string) {
    try {
      // Add cache busting parameter to avoid stale data
      const cacheBuster = `_t=${Date.now()}`;
      const urlWithCacheBuster = endpoint.includes('?') 
        ? `${endpoint}&${cacheBuster}` 
        : `${endpoint}?${cacheBuster}`;
      
      // Get the method and body
      const method = req.method;
      const requestInit: any = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': req.get('User-Agent') || 'Express-Proxy/1.0'
        }
      };

      // Add body for POST/PUT requests
      if (method === 'POST' || method === 'PUT') {
        requestInit.body = JSON.stringify(req.body);
      }

      // Make request to Cloudflare Worker
      const response = await fetch(`${CLOUDFLARE_WORKER_URL}${urlWithCacheBuster}`, requestInit);
      const data = await response.json() as any;

      // If the contact was successfully saved, send Telegram notification
      if (response.ok && data.success && endpoint === '/api/contact') {
        const contactData = req.body;
        if (contactData && contactData.name && contactData.email) {
          // Send notification in the background (don't wait for it)
          sendContactNotification({
            name: contactData.name || 'Unknown',
            email: contactData.email || 'unknown@email.com',
            phone: contactData.phone,
            subject: contactData.subject || 'Contact Form',
            message: contactData.message || ''
          }).catch(error => {
            console.error('Failed to send Telegram notification for proxied contact:', error);
          });
          
          console.log(`📬 New contact from ${contactData.name} (${contactData.email}) - Telegram notification sent (via proxy)`);
        }
      }
      
      // Set appropriate headers and return response
      res.status(response.status);
      res.set('Content-Type', response.headers.get('Content-Type') || 'application/json');
      res.json(data);
      
    } catch (error) {
      console.error('Error proxying to Cloudflare Worker:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Cloudflare Worker Proxy
  // Helper function to proxy requests to Cloudflare Worker
  async function proxyToCloudflareWorker(req: Request, res: Response, endpoint: string) {
    try {
      // Add cache busting parameter to avoid stale data
      const cacheBuster = `_t=${Date.now()}`;
      const urlWithCacheBuster = endpoint.includes('?') 
        ? `${endpoint}&${cacheBuster}` 
        : `${endpoint}?${cacheBuster}`;
      
      const url = `${CLOUDFLARE_WORKER_URL}${urlWithCacheBuster}`;
      
      // Set up headers for the proxy request
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json' 
      };
      
      // Add authentication header if in request
      if (req.headers['x-api-code']) {
        headers['X-API-Code'] = req.headers['x-api-code'] as string;
      }
      
      // Make the request to Cloudflare Worker
      const response = await fetch(url, {
        method: req.method,
        headers,
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
      });
      
      // Get the response data
      const data = await response.json();
      
      // Return the response with the same status code
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('Error proxying to Cloudflare Worker:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to connect to Cloudflare Worker API'
      });
    }
  }
  
  // CRUD operations for Services (via Cloudflare Worker)
  app.post(`${apiPrefix}/services/create`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, '/api/services/create');
  });
  
  app.put(`${apiPrefix}/services/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/services/${req.params.id}`);
  });
  
  app.delete(`${apiPrefix}/services/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/services/${req.params.id}`);
  });
  
  // CRUD operations for Training Programs (via Cloudflare Worker)
  app.post(`${apiPrefix}/training-programs/create`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, '/api/training-programs/create');
  });
  
  app.put(`${apiPrefix}/training-programs/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/training-programs/${req.params.id}`);
  });
  
  app.delete(`${apiPrefix}/training-programs/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/training-programs/${req.params.id}`);
  });
  
  // CRUD operations for Participants (via Cloudflare Worker)
  app.get(`${apiPrefix}/participants`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, '/api/participants');
  });

  app.get(`${apiPrefix}/participants/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/participants/${req.params.id}`);
  });
  
  app.post(`${apiPrefix}/participants/create`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, '/api/participants/create');
  });
  
  app.put(`${apiPrefix}/participants/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/participants/${req.params.id}`);
  });
  
  app.delete(`${apiPrefix}/participants/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/participants/${req.params.id}`);
  });
  
  // CRUD operations for Certificates (via Cloudflare Worker)
  app.get(`${apiPrefix}/certificates`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, '/api/certificates');
  });

  app.get(`${apiPrefix}/certificates/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/certificates/${req.params.id}`);
  });
  
  app.post(`${apiPrefix}/certificates/create`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, '/api/certificates/create');
  });
  
  app.put(`${apiPrefix}/certificates/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/certificates/${req.params.id}`);
  });
  
  app.delete(`${apiPrefix}/certificates/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/certificates/${req.params.id}`);
  });
  
  app.get(`${apiPrefix}/certificates/download/:certificateId`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/certificates/download/${req.params.certificateId}`);
  });
  
  // Contact management operations (via Cloudflare Worker)
  app.get(`${apiPrefix}/contacts`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, '/api/contacts');
  });

  app.get(`${apiPrefix}/contacts/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/contacts/${req.params.id}`);
  });
  
  app.put(`${apiPrefix}/contacts/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/contacts/${req.params.id}`);
  });

  app.delete(`${apiPrefix}/contacts/:id`, (req: Request, res: Response) => {
    proxyToCloudflareWorker(req, res, `/api/contacts/${req.params.id}`);
  });
  
  // Cloudflare Worker Documentation
  app.get(`${apiPrefix}/demo/cloudflare-worker`, (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: "This application is now connected to a live Cloudflare Worker API",
      worker: {
        url: CLOUDFLARE_WORKER_URL,
        authentication: {
          required: "For POST (create), PUT, PATCH and DELETE operations",
          header: "X-API-Code",
          value: process.env.API_CODE ? "[CONFIGURED]" : "[MISSING - API_CODE env variable required]"
        },
        endpoints: [
          // Services
          { path: "/api/services", method: "GET", description: "Get all services" },
          { path: "/api/services/create", method: "POST", description: "Create a new service (requires authentication)" },
          { path: "/api/services/:id", method: "PUT/PATCH", description: "Update a service (requires authentication)" },
          { path: "/api/services/:id", method: "DELETE", description: "Delete a service (requires authentication)" },
          
          // Training Programs
          { path: "/api/training-programs", method: "GET", description: "Get all training programs" },
          { path: "/api/training-programs/:id", method: "GET", description: "Get a specific training program by ID" },
          { path: "/api/training-programs/create", method: "POST", description: "Create a new training program (requires authentication)" },
          { path: "/api/training-programs/:id", method: "PUT/PATCH", description: "Update a training program (requires authentication)" },
          { path: "/api/training-programs/:id", method: "DELETE", description: "Delete a training program (requires authentication)" },
          
          // Participants
          { path: "/api/participants", method: "GET", description: "Get all participants (requires authentication)" },
          { path: "/api/participants/:id", method: "GET", description: "Get a specific participant by ID (requires authentication)" },
          { path: "/api/participants/create", method: "POST", description: "Create a new participant (requires authentication)" },
          { path: "/api/participants/:id", method: "PUT/PATCH", description: "Update a participant (requires authentication)" },
          { path: "/api/participants/:id", method: "DELETE", description: "Delete a participant (requires authentication)" },
          
          // Certificates
          { path: "/api/certificates", method: "GET", description: "Get all certificates (requires authentication)" },
          { path: "/api/certificates/:id", method: "GET", description: "Get a specific certificate by ID (requires authentication)" },
          { path: "/api/certificates/create", method: "POST", description: "Create a new certificate (requires authentication)" },
          { path: "/api/certificates/:id", method: "PUT/PATCH", description: "Update a certificate (requires authentication)" },
          { path: "/api/certificates/:id", method: "DELETE", description: "Delete a certificate (requires authentication)" },
          { path: "/api/certificates/download/:certificateId", method: "GET", description: "Get download URL for a certificate (public access, no authentication required)" },
          
          // Verification & Status
          { path: "/api/verify-certificate", method: "POST", description: "Verify a certificate's authenticity" },
          { path: "/api/check-status", method: "POST", description: "Check a participant's training status" },
          
          // Contacts
          { path: "/api/contacts", method: "GET", description: "Get all contact submissions (requires authentication)" },
          { path: "/api/contacts/:id", method: "PUT", description: "Update contact status (requires authentication)" },
          { path: "/api/contact", method: "POST", description: "Submit a contact form" }
        ]
      }
    });
  });

  // Dynamic sitemap generation with cache invalidation
  let sitemap: Buffer | null = null;
  let sitemapLastGenerated: number = 0;
  const SITEMAP_CACHE_DURATION = 3600000; // 1 hour in milliseconds
  
  // Helper function to fetch live data from Cloudflare Worker
  async function fetchLiveData() {
    try {
      const [servicesRes, trainingProgramsRes] = await Promise.all([
        fetch(`${CLOUDFLARE_WORKER_URL}/api/services`),
        fetch(`${CLOUDFLARE_WORKER_URL}/api/training-programs`)
      ]);
      
      const servicesData = await servicesRes.json() as any;
      const trainingProgramsData = await trainingProgramsRes.json() as any;
      
      return {
        services: servicesData.success ? servicesData.data : [],
        trainingPrograms: trainingProgramsData.success ? trainingProgramsData.data : []
      };
    } catch (error) {
      console.warn('Failed to fetch live data for sitemap, using fallback:', error);
      // Fallback to local storage if API fails
      return {
        services: await storage.getAllServices(),
        trainingPrograms: await storage.getAllTrainingPrograms()
      };
    }
  }
  
  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');
    
    try {
      const now = Date.now();
      const cacheExpired = now - sitemapLastGenerated > SITEMAP_CACHE_DURATION;
      
      // Check for cache query parameter to force refresh
      const forceRefresh = req.query.refresh === 'true';
      
      if (sitemap && !cacheExpired && !forceRefresh) {
        // Return cached sitemap if available and not expired
        res.send(sitemap);
        return;
      }
      
      console.log('🗺️ Generating fresh sitemap with live data...');
      
      // Create a sitemap stream
      const smStream = new SitemapStream({ hostname: DOMAIN });
      const pipeline = smStream.pipe(createGzip());
      
      // Fetch live data from Cloudflare Worker
      const { services, trainingPrograms } = await fetchLiveData();
      
      console.log(`📊 Sitemap includes: ${services.length} services, ${trainingPrograms.length} training programs`);
      
      // Static routes with SEO priorities
      smStream.write({ 
        url: '/', 
        changefreq: 'weekly', 
        priority: 1.0,
        lastmod: new Date().toISOString().split('T')[0]
      });
      smStream.write({ 
        url: '/about', 
        changefreq: 'monthly', 
        priority: 0.8,
        lastmod: new Date().toISOString().split('T')[0]
      });
      smStream.write({ 
        url: '/training-programs', 
        changefreq: 'weekly', 
        priority: 0.9,
        lastmod: new Date().toISOString().split('T')[0]
      });
      smStream.write({ 
        url: '/contact', 
        changefreq: 'monthly', 
        priority: 0.7,
        lastmod: new Date().toISOString().split('T')[0]
      });
      smStream.write({ 
        url: '/verify-certificate', 
        changefreq: 'monthly', 
        priority: 0.6,
        lastmod: new Date().toISOString().split('T')[0]
      });
      
      // Dynamic routes for services
      services.forEach((service: any) => {
        smStream.write({
          url: `/services/${service.id}`,
          changefreq: 'monthly',
          priority: 0.7,
          lastmod: new Date().toISOString().split('T')[0]
        });
      });
      
      // Dynamic routes for training programs (high priority for SEO)
      trainingPrograms.forEach((program: any) => {
        smStream.write({
          url: `/training-programs/${program.id}`,
          changefreq: 'weekly', // More frequent updates for training programs
          priority: 0.8, // Higher priority for training content
          lastmod: new Date().toISOString().split('T')[0]
        });
      });
      
      // Add category-based training program pages if categories exist
      const uniqueCategories = Array.from(new Set(trainingPrograms.map((p: any) => p.category).filter(Boolean)));
      uniqueCategories.forEach((category: string) => {
        smStream.write({
          url: `/training-programs?category=${encodeURIComponent(category)}`,
          changefreq: 'weekly',
          priority: 0.6,
          lastmod: new Date().toISOString().split('T')[0]
        });
      });
      
      // End the stream
      smStream.end();
      
      // Store the sitemap in memory for caching
      const sitemapData = await streamToPromise(pipeline);
      sitemap = sitemapData;
      sitemapLastGenerated = now;
      
      console.log('✅ Sitemap generated successfully');
      
      // Send the sitemap to the client
      res.send(sitemap);
    } catch (error) {
      console.error('❌ Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });
  
  // Clear sitemap cache endpoint for admin use
  app.post(`${apiPrefix}/sitemap/refresh`, (req: Request, res: Response) => {
    sitemap = null;
    sitemapLastGenerated = 0;
    res.json({ 
      success: true, 
      message: 'Sitemap cache cleared. Next request will generate fresh sitemap.' 
    });
  });

  // Add a catch-all route to handle client-side routing
  // NOTE: This MUST be registered after all API routes
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // Skip API routes and static assets which already have handlers
    if (req.path.startsWith('/api/') || req.path.includes('.')) {
      return next();
    }
    
    // Log client-side route access for debugging
    console.log(`Client-side route accessed: ${req.path}`);
    
    // Let the Vite middleware handle it in development
    // It will serve index.html for client-side routes
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
