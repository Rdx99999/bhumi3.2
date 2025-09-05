# Bhumi Consultancy Cloudflare Worker

This directory contains the backend implementation for the Bhumi Consultancy website using Cloudflare Workers and D1 SQLite database.

## Features

- API endpoints for services, training programs, certificate verification, and more
- Database integration with Cloudflare D1 SQLite
- Authentication for protected operations
- SQL schema for database initialization
- Sample data for testing

## API Documentation

### Authentication

Certain API endpoints (create, update, delete operations) require authentication. Authentication is implemented using an API code that must be included in the request headers:

```
X-API-Code: 7291826614
```

Without this header, protected endpoints will return a 401 Unauthorized response.

### Public Endpoints (No Authentication Required)

#### GET /api/services
Get a list of all services

#### GET /api/training-programs
Get a list of all training programs

#### GET /api/training-programs/:id
Get a specific training program by ID

#### GET /api/certificate/:id/download
Download a certificate (or get certificate data)

#### POST /api/verify-certificate
Verify the authenticity of a certificate
```json
{
  "certificateId": "BHM23051501",
  "participantName": "John Doe"
}
```

#### POST /api/check-status
Check a participant's status and enrolled programs
```json
{
  "participantId": "BHM2305P001"
}
```
or
```json
{
  "email": "john.doe@example.com"
}
```

#### POST /api/contact
Submit a contact form
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "subject": "Inquiry about training",
  "message": "I would like to learn more about your training programs.",
  "phone": "+1234567890" // Optional
}
```

### Protected Endpoints (Authentication Required)

#### POST /api/services/create
Create a new service
```json
{
  "title": "New Service",
  "description": "Description of the new service",
  "icon": "icon-class",
  "features": ["Feature 1", "Feature 2", "Feature 3"]
}
```

#### POST /api/training-programs/create
Create a new training program
```json
{
  "title": "New Training Program",
  "description": "Description of the new training program",
  "category": "Safety",
  "duration": "2 days",
  "price": 499.99,
  "imagePath": "/images/training/new-program.jpg" // Optional
}
```

#### PUT/PATCH /api/services/:id
Update an existing service (partial updates supported)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "features": ["Updated feature 1", "Updated feature 2"]
}
```

#### PUT/PATCH /api/training-programs/:id
Update an existing training program (partial updates supported)
```json
{
  "title": "Updated Training Program",
  "price": 599.99
}
```

#### DELETE /api/services/:id
Delete a service

#### DELETE /api/training-programs/:id
Delete a training program (will fail if participants are enrolled)

## Database Schema

The database schema is defined in `schema.sql` and includes tables for:

- Services
- Training Programs
- Participants
- Certificates
- Contacts

## Sample Data

Sample data for testing is provided in `sample-data.sql`.

## Authentication

To make authenticated requests to protected endpoints, include the API code in the request headers:

```
X-API-Code: 7291826614
```

## Testing

A test script (`test-worker.js`) is provided to test the Worker endpoints.

## Deployment

1. Install Wrangler CLI: `npm install -g @cloudflare/wrangler`
2. Configure `wrangler.toml` with your account ID and other settings
3. Create the D1 database: `wrangler d1 create bhumi-consultancy`
4. Update the database ID in `wrangler.toml`
5. Deploy the schema: `wrangler d1 execute bhumi-consultancy --file=./schema.sql`
6. Deploy the sample data: `wrangler d1 execute bhumi-consultancy --file=./sample-data.sql`
7. Publish the worker: `wrangler publish`