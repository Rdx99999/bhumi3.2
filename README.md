# Bhumi Consultancy Website

A secure, full-stack consultancy website offering business consulting, training programs, and certificate verification functionality. The application features a React frontend with Express.js development server and Cloudflare Workers for production deployment.

## Project Overview

Bhumi Consultancy website is built using modern, secure web technologies:

- **Frontend**: React.js with TypeScript, Tailwind CSS, Shadcn/UI component library
- **Backend**: Express.js (development) / Cloudflare Workers (production)
- **Database**: PostgreSQL with Neon (development) / Cloudflare D1 SQLite (production)
- **State Management**: TanStack Query for server state
- **Authentication**: API key-based security system
- **Deployment**: Dual environment strategy with security best practices

## Features

### 1. Services Showcase
- Display consultancy services with descriptions and features
- Highlight business consulting and audit preparation services

### 2. Training Programs
- List all training programs with categories, duration, and pricing
- Filter training programs by category and duration
- Detailed program descriptions and enrollment information

### 3. Certificate Verification System
- Verify certificate authenticity by certificate ID and participant name
- Display certificate details including issue date and status
- Certificate download functionality

### 4. Participant Status Check
- Check training status using participant ID or email
- View enrolled programs, completion status, and certificates
- Track training progress

### 5. Admin Panel
- Secure admin dashboard for managing all content
- CRUD operations for services, training programs, participants, and certificates  
- Contact form submission management
- Real-time data updates and validation

### 6. Contact Form & Notifications
- Submit inquiries through a validated contact form
- Instant Telegram notifications for new submissions
- Store contact messages in the database with status tracking

### 7. SEO Optimization
- Dynamic sitemap generation based on current content
- Proper meta tags and structured data for search engines
- Optimized robots.txt file for search engine crawling

### 8. Security Features
- API key-based authentication system
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- XSS protection with proper data handling
- Environment variable-based configuration

## Project Structure

```
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and API clients
│   │   ├── pages/           # Page components
│   │   └── ...
├── server/                  # Express server for development
│   ├── index.ts             # Server entry point with ping service
│   ├── routes.ts            # API routes and proxy configuration
│   ├── storage.ts           # In-memory storage implementation
│   ├── telegram-notifications.ts # Telegram bot integration
│   └── vite.ts              # Vite configuration for the server
├── shared/                  # Shared code between client and server
│   ├── schema.ts            # Database schema and type definitions
│   └── cloudflare-api.ts    # Cloudflare Worker API interface
├── cloudflare-worker/       # Cloudflare Worker implementation
│   ├── worker.js            # Worker code with D1 database
│   ├── wrangler.toml        # Cloudflare Worker configuration
│   ├── schema.sql           # D1 database schema
│   └── sample-data.sql      # Sample data for the D1 database
├── .env                     # Environment variables (required)
└── replit.md               # Project documentation and preferences
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Cloudflare account (for production deployment)

### Environment Setup
1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
# Cloudflare Worker Configuration
CLOUDFLARE_WORKER_URL=https://your-worker.workers.dev

# API Authentication Code (set your secure API key)
API_CODE=your_secure_api_key_here
VITE_API_CODE=your_secure_api_key_here

# Domain Configuration
DOMAIN=https://your-domain.com
VITE_DOMAIN=https://your-domain.com

# Server Configuration
PORT=5000

# Telegram Bot Configuration (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### Development Environment
To start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Admin Panel Access
Access the admin panel at `/admin` with your API key for:
- Managing services and training programs
- Viewing and managing participants
- Certificate management
- Contact form submissions

## Deployment

### Production Environment
For production deployment:
1. Build the React frontend: `npm run build`
2. Deploy the Cloudflare Worker using Wrangler CLI
3. Set up a Cloudflare D1 database and apply the schema
4. Configure environment variables in your hosting platform

## Database Schema

The application uses the following database schema:

1. **Users** - Administrative users
2. **Services** - Consultancy services information
3. **Training Programs** - Available training programs
4. **Participants** - Enrolled participants information
5. **Certificates** - Issued certificates
6. **Contacts** - Contact form submissions

## API Endpoints

The API provides secure endpoints with proper authentication:

### Public Endpoints
- GET `/api/services` - Get all services
- GET `/api/training-programs` - Get all training programs
- GET `/api/training-programs/:id` - Get a specific training program
- POST `/api/verify-certificate` - Verify a certificate
- POST `/api/check-status` - Check participant status
- POST `/api/contact` - Submit a contact form
- GET `/sitemap.xml` - Dynamic sitemap for SEO

### Admin Endpoints (require X-API-Code header)
- GET `/api/participants` - Get all participants
- POST `/api/services/create` - Create new service
- PUT `/api/services/:id` - Update service
- DELETE `/api/services/:id` - Delete service
- POST `/api/training-programs/create` - Create new training program
- PUT `/api/training-programs/:id` - Update training program
- DELETE `/api/training-programs/:id` - Delete training program
- GET `/api/certificates` - Get all certificates
- POST `/api/certificates/create` - Create new certificate
- GET `/api/contacts` - Get all contact submissions

For detailed API documentation, refer to the [Cloudflare Worker README](./cloudflare-worker/README.md).

## Security Features

### Authentication
- API key-based authentication using `X-API-Code` header
- Environment variable-based configuration (no hardcoded credentials)
- Secure admin panel access

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries
- XSS protection with proper data sanitization
- HTTPS enforcement in production

### Security Audit Status
✅ **SECURITY VERIFIED** - Recent comprehensive security audit completed with no critical vulnerabilities found.

## Certificate Verification

To test the certificate verification system, use the following sample data:
- Certificate ID: "BHM23051501"
- Participant Name: "John Doe"

## Contributing

1. Follow TypeScript best practices
2. Use proper input validation
3. Maintain security standards
4. Update tests when adding features

## License

This project is licensed under the MIT License.