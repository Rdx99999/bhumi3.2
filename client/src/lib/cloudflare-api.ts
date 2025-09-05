import { CertificateVerification, StatusCheck, ContactForm, Service, TrainingProgram, Participant, Certificate, Contact, InsertParticipant, InsertCertificate } from "@shared/schema";
import { ApiResponse, CertificateVerificationResult, ParticipantStatusResult } from "@shared/cloudflare-api";
import { apiRequest } from "./queryClient";

// API authentication code
const API_CODE = import.meta.env.VITE_API_CODE;

// Function to verify certificate
export async function verifyCertificate(data: CertificateVerification): Promise<ApiResponse<CertificateVerificationResult>> {
  try {
    const response = await apiRequest('POST', '/api/verify-certificate', data);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while verifying the certificate"
    };
  }
}

// Function to check participant status
export async function checkParticipantStatus(data: StatusCheck): Promise<ApiResponse<ParticipantStatusResult>> {
  try {
    const response = await apiRequest('POST', '/api/check-status', data);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while checking participant status"
    };
  }
}

// Function to submit contact form
export async function submitContactForm(data: ContactForm): Promise<ApiResponse<{ id: number }>> {
  try {
    const response = await apiRequest('POST', '/api/contact', {
      ...data,
      createdAt: new Date().toISOString(),
      status: "pending"
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while submitting the form"
    };
  }
}

// Function to create a new service (requires authentication)
export async function createService(data: Omit<Service, 'id'>): Promise<ApiResponse<Service>> {
  try {
    const response = await apiRequest('POST', '/api/services/create', data, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while creating the service"
    };
  }
}

// Function to update a service (requires authentication)
export async function updateService(id: number, data: Partial<Omit<Service, 'id'>>): Promise<ApiResponse<Service>> {
  try {
    const response = await apiRequest('PUT', `/api/services/${id}`, data, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while updating the service"
    };
  }
}

// Function to delete a service (requires authentication)
export async function deleteService(id: number): Promise<ApiResponse<{message: string}>> {
  try {
    const response = await apiRequest('DELETE', `/api/services/${id}`, undefined, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while deleting the service"
    };
  }
}

// Function to create a new training program (requires authentication)
export async function createTrainingProgram(data: Omit<TrainingProgram, 'id'>): Promise<ApiResponse<TrainingProgram>> {
  try {
    // Make sure image_path and imagePath are properly handled
    const processedData = {
      ...data,
      // Explicitly set image_path to null if it's empty string
      image_path: data.image_path || null,
      // Also set imagePath for backward compatibility with Cloudflare worker
      imagePath: data.image_path || null
    };
    
    console.log('Creating new training program with data:', processedData);
    
    const response = await apiRequest('POST', '/api/training-programs/create', processedData, true);
    return await response.json();
  } catch (error) {
    console.error('Error creating training program:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while creating the training program"
    };
  }
}

// Function to update a training program (requires authentication)
export async function updateTrainingProgram(id: number, data: Partial<Omit<TrainingProgram, 'id'>>): Promise<ApiResponse<TrainingProgram>> {
  try {
    // Make sure image_path and imagePath are properly handled
    const processedData = {
      ...data,
      // Explicitly set image_path to null if it's empty string
      ...(data.image_path !== undefined && { 
        image_path: data.image_path || null,
        // Also set imagePath for backward compatibility with Cloudflare worker
        imagePath: data.image_path || null 
      }),
      // Ensure price fields are properly included
      ...(data.price !== undefined && { price: Number(data.price) }),
      ...(data.online_price !== undefined && { online_price: Number(data.online_price) }),
      ...(data.offline_price !== undefined && { offline_price: Number(data.offline_price) })
    };
    
    console.log('Sending update to API for program ID:', id, 'with data:', processedData);
    
    const response = await apiRequest('PUT', `/api/training-programs/${id}`, processedData, true);
    return await response.json();
  } catch (error) {
    console.error('Error updating training program:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while updating the training program"
    };
  }
}

// Function to delete a training program (requires authentication)
export async function deleteTrainingProgram(id: number): Promise<ApiResponse<{message: string}>> {
  try {
    const response = await apiRequest('DELETE', `/api/training-programs/${id}`, undefined, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while deleting the training program"
    };
  }
}

// Participant Management Functions

// Function to get all participants (requires authentication)
export async function getAllParticipants(): Promise<ApiResponse<Participant[]>> {
  try {
    const response = await apiRequest('GET', '/api/participants', undefined, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while fetching participants"
    };
  }
}

// Function to get participant by ID (requires authentication)
export async function getParticipant(id: number): Promise<ApiResponse<Participant>> {
  try {
    const response = await apiRequest('GET', `/api/participants/${id}`, undefined, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while fetching the participant"
    };
  }
}

// Function to create a new participant (requires authentication)
export async function createParticipant(data: InsertParticipant): Promise<ApiResponse<Participant>> {
  try {
    const response = await apiRequest('POST', '/api/participants/create', data, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while creating the participant"
    };
  }
}

// Function to update a participant (requires authentication)
export async function updateParticipant(id: number, data: Partial<InsertParticipant>): Promise<ApiResponse<Participant>> {
  try {
    const response = await apiRequest('PUT', `/api/participants/${id}`, data, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while updating the participant"
    };
  }
}

// Function to delete a participant (requires authentication)
export async function deleteParticipant(id: number): Promise<ApiResponse<{message: string}>> {
  try {
    const response = await apiRequest('DELETE', `/api/participants/${id}`, undefined, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while deleting the participant"
    };
  }
}

// Certificate Management Functions

// Function to get all certificates (requires authentication)
export async function getAllCertificates(): Promise<ApiResponse<Certificate[]>> {
  try {
    const response = await apiRequest('GET', '/api/certificates', undefined, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while fetching certificates"
    };
  }
}

// Function to get certificate by ID (requires authentication)
export async function getCertificate(id: number): Promise<ApiResponse<Certificate>> {
  try {
    const response = await apiRequest('GET', `/api/certificates/${id}`, undefined, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while fetching the certificate"
    };
  }
}

// Function to create a new certificate (requires authentication)
export async function createCertificate(data: InsertCertificate): Promise<ApiResponse<Certificate>> {
  try {
    const response = await apiRequest('POST', '/api/certificates/create', data, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while creating the certificate"
    };
  }
}

// Function to update a certificate (requires authentication)
export async function updateCertificate(id: number, data: Partial<InsertCertificate>): Promise<ApiResponse<Certificate>> {
  try {
    const response = await apiRequest('PUT', `/api/certificates/${id}`, data, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while updating the certificate"
    };
  }
}

// Function to delete a certificate (requires authentication)
export async function deleteCertificate(id: number): Promise<ApiResponse<{message: string}>> {
  try {
    const response = await apiRequest('DELETE', `/api/certificates/${id}`, undefined, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while deleting the certificate"
    };
  }
}

// Function to download a certificate (requires authentication for admin)
export async function downloadCertificate(certificateId: string, requireAuth: boolean = true): Promise<ApiResponse<{ url: string, downloadUrl: string }>> {
  try {
    const response = await apiRequest('GET', `/api/certificates/download/${certificateId}`, undefined, requireAuth);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while downloading the certificate"
    };
  }
}

// Function to download a certificate (public access)
export async function downloadPublicCertificate(certificateId: string): Promise<ApiResponse<{ url: string, downloadUrl: string }>> {
  try {
    const response = await apiRequest('GET', `/api/certificates/download/${certificateId}`, undefined, false);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while downloading the certificate"
    };
  }
}

// Contact Management Functions

// Function to get all contacts (requires authentication)
export async function getAllContacts(): Promise<ApiResponse<Contact[]>> {
  try {
    const response = await apiRequest('GET', '/api/contacts', undefined, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while fetching contacts"
    };
  }
}

// Function to update contact status (requires authentication)
export async function updateContactStatus(id: number, status: string): Promise<ApiResponse<Contact>> {
  try {
    const response = await apiRequest('PUT', `/api/contacts/${id}`, { status }, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while updating the contact status"
    };
  }
}

// Function to delete a contact (requires authentication)
export async function deleteContact(id: number): Promise<ApiResponse<{message: string}>> {
  try {
    const response = await apiRequest('DELETE', `/api/contacts/${id}`, undefined, true);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while deleting the contact"
    };
  }
}

// Cloudflare Worker API Documentation for UI display
export const cloudflareWorkerDocs = {
  title: "Cloudflare Worker API Documentation",
  description: "This documentation outlines the API endpoints available in the Cloudflare Worker for Bhumi Consultancy. Some endpoints require authentication via the X-API-Code header.",
  authentication: {
    required: "For POST (create), PUT, PATCH and DELETE operations",
    header: "X-API-Code",
    value: "[CONFIGURED_VIA_ENV]"
  },
  endpointGroups: [
    {
      name: "Services",
      endpoints: [
        {
          path: "/api/services",
          method: "GET",
          description: "Get all services",
          response: "Array of service objects"
        },
        {
          path: "/api/services/create",
          method: "POST",
          description: "Create a new service (requires authentication)",
          body: "{ title: string, description: string, icon: string, features: string[] }",
          response: "Created service object",
          protected: true
        },
        {
          path: "/api/services/:id",
          method: "PUT/PATCH",
          description: "Update an existing service (requires authentication)",
          body: "{ title?: string, description?: string, icon?: string, features?: string[] }",
          response: "Updated service object",
          protected: true
        },
        {
          path: "/api/services/:id",
          method: "DELETE",
          description: "Delete a service (requires authentication)",
          response: "Success message",
          protected: true
        }
      ]
    },
    {
      name: "Training Programs",
      endpoints: [
        {
          path: "/api/training-programs",
          method: "GET",
          description: "Get all training programs",
          response: "Array of training program objects"
        },
        {
          path: "/api/training-programs/:id",
          method: "GET",
          description: "Get a specific training program by ID",
          response: "Training program object"
        },
        {
          path: "/api/training-programs/create",
          method: "POST",
          description: "Create a new training program (requires authentication)",
          body: "{ title: string, description: string, category: string, duration: string, price: number, imagePath?: string }",
          response: "Created training program object",
          protected: true
        },
        {
          path: "/api/training-programs/:id",
          method: "PUT/PATCH",
          description: "Update an existing training program (requires authentication)",
          body: "{ title?: string, description?: string, category?: string, duration?: string, price?: number, imagePath?: string }",
          response: "Updated training program object",
          protected: true
        },
        {
          path: "/api/training-programs/:id",
          method: "DELETE",
          description: "Delete a training program (requires authentication). Will fail if participants are enrolled.",
          response: "Success message",
          protected: true
        }
      ]
    },
    {
      name: "Participants",
      endpoints: [
        {
          path: "/api/participants",
          method: "GET",
          description: "Get all participants (requires authentication)",
          response: "Array of participant objects",
          protected: true
        },
        {
          path: "/api/participants/:id",
          method: "GET",
          description: "Get a specific participant by ID (requires authentication)",
          response: "Participant object",
          protected: true
        },
        {
          path: "/api/participants/create",
          method: "POST",
          description: "Create a new participant (requires authentication)",
          body: "{ participantId: string, fullName: string, email: string, phone?: string, trainingProgramId: number, enrollmentDate: string, status: string }",
          response: "Created participant object",
          protected: true
        },
        {
          path: "/api/participants/:id",
          method: "PUT/PATCH",
          description: "Update an existing participant (requires authentication)",
          body: "{ participantId?: string, fullName?: string, email?: string, phone?: string, trainingProgramId?: number, enrollmentDate?: string, status?: string }",
          response: "Updated participant object",
          protected: true
        },
        {
          path: "/api/participants/:id",
          method: "DELETE",
          description: "Delete a participant (requires authentication). Will fail if certificates exist.",
          response: "Success message",
          protected: true
        }
      ]
    },
    {
      name: "Certificates",
      endpoints: [
        {
          path: "/api/certificates",
          method: "GET",
          description: "Get all certificates (requires authentication)",
          response: "Array of certificate objects",
          protected: true
        },
        {
          path: "/api/certificates/:id",
          method: "GET",
          description: "Get a specific certificate by ID (requires authentication)",
          response: "Certificate object",
          protected: true
        },
        {
          path: "/api/certificates/create",
          method: "POST",
          description: "Create a new certificate (requires authentication)",
          body: "{ certificateId: string, participantId: number, trainingProgramId: number, issueDate: string, expiryDate?: string, certificatePath?: string }",
          response: "Created certificate object",
          protected: true
        },
        {
          path: "/api/certificates/:id",
          method: "PUT/PATCH",
          description: "Update an existing certificate (requires authentication)",
          body: "{ certificateId?: string, participantId?: number, trainingProgramId?: number, issueDate?: string, expiryDate?: string, certificatePath?: string }",
          response: "Updated certificate object",
          protected: true
        },
        {
          path: "/api/certificates/:id",
          method: "DELETE",
          description: "Delete a certificate (requires authentication)",
          response: "Success message",
          protected: true
        },
        {
          path: "/api/certificates/download/:certificateId",
          method: "GET",
          description: "Get download URL for a certificate (public access, no authentication required)",
          response: "Certificate download URL object",
          protected: false
        }
      ]
    },
    {
      name: "Certificate Verification",
      endpoints: [
        {
          path: "/api/verify-certificate",
          method: "POST",
          description: "Verify a certificate's authenticity",
          body: "{ certificateId: string, participantName: string }",
          response: "Certificate verification result"
        }
      ]
    },
    {
      name: "Participant Status",
      endpoints: [
        {
          path: "/api/check-status",
          method: "POST",
          description: "Check a participant's training status",
          body: "{ participantId: string, email: string }",
          response: "Participant status result with enrolled programs"
        }
      ]
    },
    {
      name: "Contacts",
      endpoints: [
        {
          path: "/api/contacts",
          method: "GET",
          description: "Get all contact submissions (requires authentication)",
          response: "Array of contact objects",
          protected: true
        },
        {
          path: "/api/contacts/:id",
          method: "PUT",
          description: "Update contact status (requires authentication)",
          body: "{ status: string }",
          response: "Updated contact object",
          protected: true
        },
        {
          path: "/api/contact",
          method: "POST",
          description: "Submit a contact form",
          body: "{ name: string, email: string, phone?: string, subject: string, message: string }",
          response: "Contact submission confirmation"
        }
      ]
    }
  ],
  dbSchema: {
    tables: [
      {
        name: "users",
        description: "Store user information for admin access",
        columns: [
          { name: "id", type: "INTEGER", description: "Primary key" },
          { name: "username", type: "TEXT", description: "Unique username" },
          { name: "password", type: "TEXT", description: "Hashed password" },
          { name: "full_name", type: "TEXT", description: "User's full name" },
          { name: "email", type: "TEXT", description: "User's email address" },
          { name: "phone", type: "TEXT", description: "User's phone number (optional)" },
          { name: "role", type: "TEXT", description: "User role (default: 'user')" }
        ]
      },
      {
        name: "services",
        description: "Store service information",
        columns: [
          { name: "id", type: "INTEGER", description: "Primary key" },
          { name: "title", type: "TEXT", description: "Service title" },
          { name: "description", type: "TEXT", description: "Service description" },
          { name: "icon", type: "TEXT", description: "Service icon name" },
          { name: "features", type: "TEXT", description: "JSON array of features" }
        ]
      },
      {
        name: "training_programs",
        description: "Store training program information",
        columns: [
          { name: "id", type: "INTEGER", description: "Primary key" },
          { name: "title", type: "TEXT", description: "Program title" },
          { name: "description", type: "TEXT", description: "Program description" },
          { name: "category", type: "TEXT", description: "Program category" },
          { name: "duration", type: "TEXT", description: "Program duration" },
          { name: "price", type: "INTEGER", description: "Program price" },
          { name: "image_path", type: "TEXT", description: "Path to program image (optional)" }
        ]
      },
      {
        name: "participants",
        description: "Store participant information",
        columns: [
          { name: "id", type: "INTEGER", description: "Primary key" },
          { name: "participant_id", type: "TEXT", description: "Unique participant ID" },
          { name: "full_name", type: "TEXT", description: "Participant's full name" },
          { name: "email", type: "TEXT", description: "Participant's email address" },
          { name: "phone", type: "TEXT", description: "Participant's phone number (optional)" },
          { name: "training_program_id", type: "INTEGER", description: "Foreign key to training_programs" },
          { name: "enrollment_date", type: "TIMESTAMP", description: "Date of enrollment" },
          { name: "status", type: "TEXT", description: "Participant status (default: 'active')" }
        ]
      },
      {
        name: "certificates",
        description: "Store certificate information",
        columns: [
          { name: "id", type: "INTEGER", description: "Primary key" },
          { name: "certificate_id", type: "TEXT", description: "Unique certificate ID" },
          { name: "participant_id", type: "INTEGER", description: "Foreign key to participants" },
          { name: "training_program_id", type: "INTEGER", description: "Foreign key to training_programs" },
          { name: "issue_date", type: "TIMESTAMP", description: "Date of certificate issuance" },
          { name: "expiry_date", type: "TIMESTAMP", description: "Certificate expiry date (optional)" },
          { name: "certificate_path", type: "TEXT", description: "Path to certificate file (optional)" }
        ]
      },
      {
        name: "contacts",
        description: "Store contact form submissions",
        columns: [
          { name: "id", type: "INTEGER", description: "Primary key" },
          { name: "full_name", type: "TEXT", description: "Contact's full name" },
          { name: "email", type: "TEXT", description: "Contact's email address" },
          { name: "phone", type: "TEXT", description: "Contact's phone number (optional)" },
          { name: "subject", type: "TEXT", description: "Contact form subject" },
          { name: "message", type: "TEXT", description: "Contact message" },
          { name: "created_at", type: "TIMESTAMP", description: "Submission timestamp" },
          { name: "status", type: "TEXT", description: "Status of the contact (default: 'pending')" }
        ]
      }
    ]
  }
};
