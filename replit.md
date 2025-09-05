# Bhumi Consultancy Website

## Overview

A full-stack consultancy website for Bhumi Consultancy Services offering business consulting, training programs, and certificate verification functionality. The application features a React frontend with Express.js development server and Cloudflare Workers for production deployment. The website includes services showcase, training program management, certificate verification system, participant status tracking, and contact forms with SEO optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript for type safety
- **Styling**: Tailwind CSS with Shadcn/UI component library for consistent design
- **State Management**: TanStack Query for server state management and data fetching
- **Routing**: Wouter for client-side routing with mobile-friendly navigation
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Animation**: Framer Motion for smooth UI transitions and loading states
- **SEO**: React Helmet for dynamic meta tags and structured data

### Backend Architecture
- **Development**: Express.js server with TypeScript
- **Production**: Cloudflare Workers for serverless deployment
- **Database**: PostgreSQL with Drizzle ORM for development, Cloudflare D1 (SQLite) for production
- **API Design**: RESTful endpoints with standardized JSON responses
- **Authentication**: API key-based authentication for admin operations
- **Error Handling**: Centralized error handling with Zod validation

### Data Storage Solutions
- **Primary Database**: PostgreSQL (development) / Cloudflare D1 SQLite (production)
- **ORM**: Drizzle ORM with schema-first approach
- **Connection**: Neon serverless for PostgreSQL development
- **Storage Pattern**: In-memory storage fallback for development environments

### Authentication and Authorization
- **Admin Access**: API key-based authentication (X-API-Code header)
- **Public Endpoints**: Open access for services, training programs, certificate verification
- **Protected Operations**: CRUD operations require API key authentication
- **Session Management**: Client-side storage for admin authentication state

### Key Features Architecture
- **Services Management**: CRUD operations for consultancy services with feature arrays
- **Training Programs**: Category-based program management with enrollment tracking
- **Certificate System**: Verification by certificate ID and participant name with download functionality
- **Participant Tracking**: Status checking via participant ID or email
- **Contact System**: Form submissions with validation and admin management
- **SEO System**: Dynamic sitemap generation and structured data for search optimization

## External Dependencies

### Third-party Services
- **Neon Database**: PostgreSQL serverless database for development
- **Cloudflare Workers**: Serverless compute platform for production API
- **Cloudflare D1**: SQLite database service for production data storage

### APIs and Integrations
- **Cloudflare Workers API**: Custom API endpoints for all backend operations
- **Certificate Verification API**: Custom endpoints for certificate authentication
- **Contact Form API**: Message submission and management endpoints

### Development Tools
- **Vite**: Build tool and development server with hot reload
- **TypeScript**: Type checking and development experience
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Fast bundling for production builds

### UI Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **Framer Motion**: Animation library for enhanced user experience

### Deployment Architecture
- **Frontend**: Static site deployment with Vite build output
- **Backend**: Dual deployment strategy (Express.js dev / Cloudflare Workers prod)
- **Database**: Environment-specific database connections
- **CDN**: Asset delivery through build optimization and caching