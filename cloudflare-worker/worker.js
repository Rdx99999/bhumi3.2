/**
 * Bhumi Consultancy - Cloudflare Worker
 * 
 * This worker handles the API endpoints for the Bhumi Consultancy website,
 * interacting with Cloudflare D1 database for CRUD operations.
 */

// D1 database binding name
// In the real Cloudflare Worker environment, this binding will be configured in wrangler.toml
// const DB = 'bhumi_consultancy_db';

/**
 * Helper Functions
 */

// JSON response helper
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Error response helper
function errorResponse(message, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

// Success response helper
function successResponse(data) {
  return jsonResponse({ success: true, data });
}

// Authentication helper - checks if API code is valid
function authenticateApiRequest(request) {
  const apiCode = request.headers.get('X-API-Code');
  const requiredApiCode = '7291826614';

  if (!apiCode || apiCode !== requiredApiCode) {
    return false;
  }

  return true;
}

// Validate certificate verification request
function validateCertificateVerification(data) {
  if (!data || !data.certificateId || !data.participantName) {
    return false;
  }
  return true;
}

// Validate participant status check request
function validateStatusCheck(data) {
  if (!data || (!data.participantId && !data.email)) {
    return false;
  }
  return true;
}

// Validate contact form request
function validateContactForm(data) {
  if (!data || !data.name || !data.email || !data.subject || !data.message) {
    return false;
  }
  return true;
}

// Validate participant data
function validateParticipant(data) {
  if (!data || !data.participantId || !data.fullName || !data.email || !data.trainingProgramId || !data.enrollmentDate) {
    return false;
  }
  return true;
}

// Validate certificate data
function validateCertificate(data) {
  if (!data || !data.certificateId || !data.participantId || !data.trainingProgramId || !data.issueDate) {
    return false;
  }
  return true;
}

// Generate SEO-friendly slug from title
function generateSlug(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Replace special characters and spaces with hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * API Route Handlers
 */

// GET /api/services - Get all services
async function handleGetServices(env) {
  try {
    const services = await env.DB.prepare(
      'SELECT * FROM services'
    ).all();

    // Parse features JSON string into an array
    const servicesWithParsedFeatures = services.results.map(service => ({
      ...service,
      features: JSON.parse(service.features)
    }));

    return successResponse(servicesWithParsedFeatures);
  } catch (error) {
    return errorResponse(`Failed to fetch services: ${error.message}`);
  }
}

// GET /api/services/:id - Get a specific service
async function handleGetService(env, id) {
  try {
    const service = await env.DB.prepare(
      'SELECT * FROM services WHERE id = ?'
    ).bind(id).first();

    if (!service) {
      return errorResponse('Service not found', 404);
    }

    // Parse features JSON string into an array
    service.features = JSON.parse(service.features);

    return successResponse(service);
  } catch (error) {
    return errorResponse(`Failed to fetch service: ${error.message}`);
  }
}

// GET /api/training-programs - Get all training programs
async function handleGetTrainingPrograms(env) {
  try {
    const programs = await env.DB.prepare(
      'SELECT * FROM training_programs'
    ).all();

    return successResponse(programs.results);
  } catch (error) {
    return errorResponse(`Failed to fetch training programs: ${error.message}`);
  }
}

// GET /api/training-programs/:identifier - Get a specific training program by ID or slug
async function handleGetTrainingProgram(env, identifier) {
  try {
    let program;
    
    // Check if identifier is a number (ID) or string (slug)
    if (/^\d+$/.test(identifier)) {
      // It's a numeric ID
      program = await env.DB.prepare(
        'SELECT * FROM training_programs WHERE id = ?'
      ).bind(parseInt(identifier)).first();
    } else {
      // It's a slug
      program = await env.DB.prepare(
        'SELECT * FROM training_programs WHERE slug = ?'
      ).bind(identifier).first();
    }

    if (!program) {
      return errorResponse('Training program not found', 404);
    }

    return successResponse(program);
  } catch (error) {
    return errorResponse(`Failed to fetch training program: ${error.message}`);
  }
}

// POST /api/verify-certificate - Verify a certificate
async function handleVerifyCertificate(env, data) {
  try {
    if (!validateCertificateVerification(data)) {
      return errorResponse('Invalid certificate verification request', 400);
    }

    // Query certificate, participant, and training program details
    const query = `
      SELECT 
        c.certificate_id, c.issue_date, c.expiry_date, c.certificate_path,
        p.full_name, p.id as participant_id,
        tp.title as training_name, tp.id as training_id
      FROM certificates c
      JOIN participants p ON c.participant_id = p.id
      JOIN training_programs tp ON c.training_program_id = tp.id
      WHERE c.certificate_id = ? AND p.full_name = ?
    `;

    const result = await env.DB.prepare(query)
      .bind(data.certificateId, data.participantName)
      .first();

    if (!result) {
      return errorResponse('Certificate not found or details do not match', 404);
    }

    // Determine certificate status
    let status = 'active';
    const now = new Date();
    const expiryDate = result.expiry_date ? new Date(result.expiry_date) : null;

    if (expiryDate && now > expiryDate) {
      status = 'expired';
    }

    const verificationResult = {
      certificate: {
        certificateId: result.certificate_id,
        issueDate: result.issue_date,
        status: status,
        certificatePath: result.certificate_path
      },
      participant: {
        name: result.full_name,
        id: result.participant_id
      },
      training: {
        name: result.training_name,
        id: result.training_id
      }
    };

    return successResponse(verificationResult);
  } catch (error) {
    return errorResponse(`Failed to verify certificate: ${error.message}`);
  }
}

// POST /api/check-status - Check participant status
async function handleCheckParticipantStatus(env, data) {
  try {
    if (!validateStatusCheck(data)) {
      return errorResponse('Invalid status check request', 400);
    }

    // Find participant by ID or email
    let participantQuery = '';
    let queryParam = '';

    if (data.participantId) {
      participantQuery = 'SELECT * FROM participants WHERE participant_id = ?';
      queryParam = data.participantId;
    } else {
      participantQuery = 'SELECT * FROM participants WHERE email = ?';
      queryParam = data.email;
    }

    const participant = await env.DB.prepare(participantQuery)
      .bind(queryParam)
      .first();

    if (!participant) {
      return errorResponse('Participant not found', 404);
    }

    // Get all programs the participant is enrolled in
    const enrolledProgramsQuery = `
      SELECT 
        tp.id, tp.title, c.issue_date as completion_date, c.certificate_id
      FROM training_programs tp
      JOIN participants p ON p.training_program_id = tp.id
      LEFT JOIN certificates c ON c.participant_id = p.id AND c.training_program_id = tp.id
      WHERE p.id = ?
    `;

    const enrolledPrograms = await env.DB.prepare(enrolledProgramsQuery)
      .bind(participant.id)
      .all();

    // Format the enrolled programs
    const formattedPrograms = enrolledPrograms.results.map(program => ({
      id: program.id,
      name: program.title,
      completionDate: program.completion_date || undefined,
      certificateId: program.certificate_id || undefined
    }));

    const statusResult = {
      participant: {
        participantId: participant.participant_id,
        name: participant.full_name,
        status: participant.status
      },
      enrolledPrograms: formattedPrograms
    };

    return successResponse(statusResult);
  } catch (error) {
    return errorResponse(`Failed to check participant status: ${error.message}`);
  }
}

// POST /api/contact - Submit contact form
async function handleContactForm(env, data) {
  try {
    if (!validateContactForm(data)) {
      return errorResponse('Invalid contact form data', 400);
    }

    const now = new Date().toISOString();

    const result = await env.DB.prepare(`
      INSERT INTO contacts (full_name, email, phone, subject, message, created_at, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      data.name,
      data.email,
      data.phone || null,
      data.subject,
      data.message,
      now
    ).run();

    return successResponse({ id: result.lastRowId });
  } catch (error) {
    return errorResponse(`Failed to submit contact form: ${error.message}`);
  }
}

// GET /api/certificate/:id/download - Download certificate
async function handleCertificateDownload(env, certificateId) {
  try {
    // First, check if the certificate exists
    const certificate = await env.DB.prepare(
      'SELECT c.*, p.full_name, tp.title as training_title FROM certificates c ' +
      'JOIN participants p ON c.participant_id = p.id ' +
      'JOIN training_programs tp ON c.training_program_id = tp.id ' +
      'WHERE c.certificate_id = ?'
    ).bind(certificateId).first();

    if (!certificate) {
      return errorResponse('Certificate not found', 404);
    }

    // In a real implementation, we would generate a PDF certificate here
    // or retrieve the certificate file from R2 or another storage
    // For this demo, we'll return a JSON response with the certificate data

    // Use the certificate_path from database if available, otherwise fallback to a default URL
    const downloadUrl = certificate.certificate_path 
      ? certificate.certificate_path 
      : `https://bhumi-consultancy.com/certificates/${certificate.certificate_id}.pdf`;

    const certificateData = {
      id: certificate.certificate_id,
      participantName: certificate.full_name,
      trainingProgram: certificate.training_title,
      issueDate: certificate.issue_date,
      expiryDate: certificate.expiry_date,
      downloadUrl: downloadUrl,
      url: downloadUrl // Include url for compatibility with current frontend
    };

    return successResponse(certificateData);
  } catch (error) {
    return errorResponse(`Failed to download certificate: ${error.message}`);
  }
}

// POST /api/services/create - Create a new service
async function handleCreateService(env, data) {
  try {
    // Validate service data
    if (!data || !data.title || !data.description || !data.icon || !data.features) {
      return errorResponse('Invalid service data. Title, description, icon, and features are required.', 400);
    }

    // Convert features array to JSON string if it's an array
    const featuresJson = Array.isArray(data.features) ? JSON.stringify(data.features) : data.features;

    // Insert the new service
    const result = await env.DB.prepare(`
      INSERT INTO services (title, description, icon, features)
      VALUES (?, ?, ?, ?)
    `).bind(
      data.title,
      data.description,
      data.icon,
      featuresJson
    ).run();

    // Get the newly created service
    const newService = await env.DB.prepare(
      'SELECT * FROM services WHERE id = ?'
    ).bind(result.lastRowId).first();

    // Parse features JSON string into an array
    newService.features = JSON.parse(newService.features);

    return successResponse(newService);
  } catch (error) {
    return errorResponse(`Failed to create service: ${error.message}`);
  }
}

// POST /api/training-programs/create - Create a new training program
async function handleCreateTrainingProgram(env, data) {
  try {
    // Validate training program data
    if (!data || !data.title || !data.description || !data.category || !data.duration) {
      return errorResponse('Invalid training program data. Title, description, category, and duration are required.', 400);
    }

    // Generate slug from title if not provided
    let slug = data.slug || generateSlug(data.title);
    
    // Check if slug already exists and make it unique if necessary
    let slugExists = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM training_programs WHERE slug = ?'
    ).bind(slug).first();
    
    let counter = 1;
    let originalSlug = slug;
    while (slugExists.count > 0) {
      slug = `${originalSlug}-${counter}`;
      slugExists = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM training_programs WHERE slug = ?'
      ).bind(slug).first();
      counter++;
    }

    // Handle pricing - support both old and new pricing structure
    let price, onlinePrice, offlinePrice, deliveryMode;
    
    if (data.online_price || data.offline_price) {
      // New pricing structure
      onlinePrice = data.online_price || 0;
      offlinePrice = data.offline_price || 0;
      deliveryMode = data.delivery_mode || 'both';
      price = onlinePrice; // Set price to online_price for backward compatibility
    } else if (data.price) {
      // Legacy pricing structure
      price = data.price;
      onlinePrice = data.price;
      offlinePrice = data.price;
      deliveryMode = 'both';
    } else {
      return errorResponse('Either price or online_price/offline_price is required.', 400);
    }

    // Insert the new training program
    const result = await env.DB.prepare(`
      INSERT INTO training_programs (title, slug, description, category, duration, price, online_price, offline_price, delivery_mode, image_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.title,
      slug,
      data.description,
      data.category,
      data.duration,
      price,
      onlinePrice,
      offlinePrice,
      deliveryMode,
      // Handle both naming conventions for image_path
      (data.image_path !== undefined ? data.image_path : data.imagePath) || null
    ).run();

    // Get the newly created training program
    const newProgram = await env.DB.prepare(
      'SELECT * FROM training_programs WHERE id = ?'
    ).bind(result.lastRowId).first();

    return successResponse(newProgram);
  } catch (error) {
    return errorResponse(`Failed to create training program: ${error.message}`);
  }
}

// DELETE /api/services/:id - Delete a service
async function handleDeleteService(env, id) {
  try {
    // Check if the service exists
    const service = await env.DB.prepare(
      'SELECT * FROM services WHERE id = ?'
    ).bind(id).first();

    if (!service) {
      return errorResponse('Service not found', 404);
    }

    // Delete the service
    await env.DB.prepare(
      'DELETE FROM services WHERE id = ?'
    ).bind(id).run();

    return successResponse({ message: `Service with ID ${id} has been deleted successfully` });
  } catch (error) {
    return errorResponse(`Failed to delete service: ${error.message}`);
  }
}

// DELETE /api/training-programs/:id - Delete a training program
async function handleDeleteTrainingProgram(env, id) {
  try {
    // Check if the training program exists
    const program = await env.DB.prepare(
      'SELECT * FROM training_programs WHERE id = ?'
    ).bind(id).first();

    if (!program) {
      return errorResponse('Training program not found', 404);
    }

    // Check if there are any participants enrolled in this program
    const enrolledParticipants = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM participants WHERE training_program_id = ?'
    ).bind(id).first();

    if (enrolledParticipants.count > 0) {
      return errorResponse(`Cannot delete training program: ${enrolledParticipants.count} participants are enrolled in this program.`, 400);
    }

    // Delete the training program
    await env.DB.prepare(
      'DELETE FROM training_programs WHERE id = ?'
    ).bind(id).run();

    return successResponse({ message: `Training program with ID ${id} has been deleted successfully` });
  } catch (error) {
    return errorResponse(`Failed to delete training program: ${error.message}`);
  }
}

// PUT/PATCH /api/services/:id - Update a service
async function handleUpdateService(env, id, data) {
  try {
    // Check if the service exists
    const service = await env.DB.prepare(
      'SELECT * FROM services WHERE id = ?'
    ).bind(id).first();

    if (!service) {
      return errorResponse('Service not found', 404);
    }

    // Validate service data
    if (!data || Object.keys(data).length === 0) {
      return errorResponse('No update data provided', 400);
    }

    // Convert features array to JSON string if it's provided and it's an array
    const featuresJson = data.features 
      ? (Array.isArray(data.features) ? JSON.stringify(data.features) : data.features)
      : undefined;

    // Build the update SQL dynamically based on what fields are provided
    let updateFields = [];
    let values = [];

    if (data.title !== undefined) {
      updateFields.push('title = ?');
      values.push(data.title);
    }

    if (data.description !== undefined) {
      updateFields.push('description = ?');
      values.push(data.description);
    }

    if (data.icon !== undefined) {
      updateFields.push('icon = ?');
      values.push(data.icon);
    }

    if (featuresJson !== undefined) {
      updateFields.push('features = ?');
      values.push(featuresJson);
    }

    if (updateFields.length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    // Add the ID as the last parameter
    values.push(id);

    // Execute the update
    await env.DB.prepare(
      `UPDATE services SET ${updateFields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    // Get the updated service
    const updatedService = await env.DB.prepare(
      'SELECT * FROM services WHERE id = ?'
    ).bind(id).first();

    // Parse features JSON string into an array
    updatedService.features = JSON.parse(updatedService.features);

    return successResponse(updatedService);
  } catch (error) {
    return errorResponse(`Failed to update service: ${error.message}`);
  }
}

// GET /api/participants - Get all participants
async function handleGetParticipants(env) {
  try {
    const participants = await env.DB.prepare(
      'SELECT p.*, tp.title as training_program_name FROM participants p LEFT JOIN training_programs tp ON p.training_program_id = tp.id'
    ).all();

    return successResponse(participants.results);
  } catch (error) {
    return errorResponse(`Failed to fetch participants: ${error.message}`);
  }
}

// GET /api/participants/:id - Get a specific participant
async function handleGetParticipant(env, id) {
  try {
    const participant = await env.DB.prepare(
      'SELECT p.*, tp.title as training_program_name FROM participants p LEFT JOIN training_programs tp ON p.training_program_id = tp.id WHERE p.id = ?'
    ).bind(id).first();

    if (!participant) {
      return errorResponse('Participant not found', 404);
    }

    return successResponse(participant);
  } catch (error) {
    return errorResponse(`Failed to fetch participant: ${error.message}`);
  }
}

// POST /api/participants/create - Create a new participant
async function handleCreateParticipant(env, data) {
  try {
    if (!validateParticipant(data)) {
      return errorResponse('Invalid participant data. Required fields are missing.', 400);
    }

    // Check if training program exists
    const trainingProgram = await env.DB.prepare(
      'SELECT * FROM training_programs WHERE id = ?'
    ).bind(data.trainingProgramId).first();

    if (!trainingProgram) {
      return errorResponse('Training program not found', 404);
    }

    // Check if participant ID is unique
    const existingParticipant = await env.DB.prepare(
      'SELECT * FROM participants WHERE participant_id = ?'
    ).bind(data.participantId).first();

    if (existingParticipant) {
      return errorResponse('Participant ID already exists', 400);
    }

    // Insert the new participant
    const result = await env.DB.prepare(`
      INSERT INTO participants (participant_id, full_name, email, phone, training_program_id, enrollment_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.participantId,
      data.fullName,
      data.email,
      data.phone || null,
      data.trainingProgramId,
      data.enrollmentDate,
      data.status || 'active'
    ).run();

    // Get the newly created participant
    const newParticipant = await env.DB.prepare(
      'SELECT p.*, tp.title as training_program_name FROM participants p LEFT JOIN training_programs tp ON p.training_program_id = tp.id WHERE p.id = ?'
    ).bind(result.lastRowId).first();

    return successResponse(newParticipant);
  } catch (error) {
    return errorResponse(`Failed to create participant: ${error.message}`);
  }
}

// PUT/PATCH /api/participants/:id - Update a participant
async function handleUpdateParticipant(env, id, data) {
  try {
    // Check if the participant exists
    const participant = await env.DB.prepare(
      'SELECT * FROM participants WHERE id = ?'
    ).bind(id).first();

    if (!participant) {
      return errorResponse('Participant not found', 404);
    }

    // Validate participant data
    if (!data || Object.keys(data).length === 0) {
      return errorResponse('No update data provided', 400);
    }

    // If training program ID is provided, check if it exists
    if (data.trainingProgramId) {
      const trainingProgram = await env.DB.prepare(
        'SELECT * FROM training_programs WHERE id = ?'
      ).bind(data.trainingProgramId).first();

      if (!trainingProgram) {
        return errorResponse('Training program not found', 404);
      }
    }

    // If participant ID is provided, check if it's unique
    if (data.participantId && data.participantId !== participant.participant_id) {
      const existingParticipant = await env.DB.prepare(
        'SELECT * FROM participants WHERE participant_id = ?'
      ).bind(data.participantId).first();

      if (existingParticipant) {
        return errorResponse('Participant ID already exists', 400);
      }
    }

    // Build the update SQL dynamically based on what fields are provided
    let updateFields = [];
    let values = [];

    if (data.participantId !== undefined) {
      updateFields.push('participant_id = ?');
      values.push(data.participantId);
    }

    if (data.fullName !== undefined) {
      updateFields.push('full_name = ?');
      values.push(data.fullName);
    }

    if (data.email !== undefined) {
      updateFields.push('email = ?');
      values.push(data.email);
    }

    if (data.phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(data.phone);
    }

    if (data.trainingProgramId !== undefined) {
      updateFields.push('training_program_id = ?');
      values.push(data.trainingProgramId);
    }

    if (data.enrollmentDate !== undefined) {
      updateFields.push('enrollment_date = ?');
      values.push(data.enrollmentDate);
    }

    if (data.status !== undefined) {
      updateFields.push('status = ?');
      values.push(data.status);
    }

    if (updateFields.length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    // Add the ID as the last parameter
    values.push(id);

    // Execute the update
    await env.DB.prepare(
      `UPDATE participants SET ${updateFields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    // Get the updated participant
    const updatedParticipant = await env.DB.prepare(
      'SELECT p.*, tp.title as training_program_name FROM participants p LEFT JOIN training_programs tp ON p.training_program_id = tp.id WHERE p.id = ?'
    ).bind(id).first();

    return successResponse(updatedParticipant);
  } catch (error) {
    return errorResponse(`Failed to update participant: ${error.message}`);
  }
}

// DELETE /api/participants/:id - Delete a participant
async function handleDeleteParticipant(env, id) {
  try {
    // Check if the participant exists
    const participant = await env.DB.prepare(
      'SELECT * FROM participants WHERE id = ?'
    ).bind(id).first();

    if (!participant) {
      return errorResponse('Participant not found', 404);
    }

    // Check if there are any certificates for this participant
    const certificates = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM certificates WHERE participant_id = ?'
    ).bind(id).first();

    if (certificates.count > 0) {
      return errorResponse(`Cannot delete participant: ${certificates.count} certificates are associated with this participant.`, 400);
    }

    // Delete the participant
    await env.DB.prepare(
      'DELETE FROM participants WHERE id = ?'
    ).bind(id).run();

    return successResponse({ message: `Participant with ID ${id} has been deleted successfully` });
  } catch (error) {
    return errorResponse(`Failed to delete participant: ${error.message}`);
  }
}

// GET /api/certificates - Get all certificates
async function handleGetCertificates(env) {
  try {
    const certificates = await env.DB.prepare(`
      SELECT c.*, 
        p.full_name as participant_name, 
        tp.title as training_program_name 
      FROM certificates c 
      JOIN participants p ON c.participant_id = p.id 
      JOIN training_programs tp ON c.training_program_id = tp.id
    `).all();

    return successResponse(certificates.results);
  } catch (error) {
    return errorResponse(`Failed to fetch certificates: ${error.message}`);
  }
}

// GET /api/certificates/:id - Get a specific certificate
async function handleGetCertificate(env, id) {
  try {
    const certificate = await env.DB.prepare(`
      SELECT c.*, 
        p.full_name as participant_name, 
        tp.title as training_program_name 
      FROM certificates c 
      JOIN participants p ON c.participant_id = p.id 
      JOIN training_programs tp ON c.training_program_id = tp.id
      WHERE c.id = ?
    `).bind(id).first();

    if (!certificate) {
      return errorResponse('Certificate not found', 404);
    }

    return successResponse(certificate);
  } catch (error) {
    return errorResponse(`Failed to fetch certificate: ${error.message}`);
  }
}

// POST /api/certificates/create - Create a new certificate
async function handleCreateCertificate(env, data) {
  try {
    if (!validateCertificate(data)) {
      return errorResponse('Invalid certificate data. Required fields are missing.', 400);
    }

    // Check if participant exists
    const participant = await env.DB.prepare(
      'SELECT * FROM participants WHERE id = ?'
    ).bind(data.participantId).first();

    if (!participant) {
      return errorResponse('Participant not found', 404);
    }

    // Check if training program exists
    const trainingProgram = await env.DB.prepare(
      'SELECT * FROM training_programs WHERE id = ?'
    ).bind(data.trainingProgramId).first();

    if (!trainingProgram) {
      return errorResponse('Training program not found', 404);
    }

    // Check if certificate ID is unique
    const existingCertificate = await env.DB.prepare(
      'SELECT * FROM certificates WHERE certificate_id = ?'
    ).bind(data.certificateId).first();

    if (existingCertificate) {
      return errorResponse('Certificate ID already exists', 400);
    }

    // Insert the new certificate
    const result = await env.DB.prepare(`
      INSERT INTO certificates (certificate_id, participant_id, training_program_id, issue_date, expiry_date, certificate_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.certificateId,
      data.participantId,
      data.trainingProgramId,
      data.issueDate,
      data.expiryDate || null,
      data.certificatePath || null
    ).run();

    // Get the newly created certificate
    const newCertificate = await env.DB.prepare(`
      SELECT c.*, 
        p.full_name as participant_name, 
        tp.title as training_program_name 
      FROM certificates c 
      JOIN participants p ON c.participant_id = p.id 
      JOIN training_programs tp ON c.training_program_id = tp.id
      WHERE c.id = ?
    `).bind(result.lastRowId).first();

    return successResponse(newCertificate);
  } catch (error) {
    return errorResponse(`Failed to create certificate: ${error.message}`);
  }
}

// PUT/PATCH /api/certificates/:id - Update a certificate
async function handleUpdateCertificate(env, id, data) {
  try {
    // Check if the certificate exists
    const certificate = await env.DB.prepare(
      'SELECT * FROM certificates WHERE id = ?'
    ).bind(id).first();

    if (!certificate) {
      return errorResponse('Certificate not found', 404);
    }

    // Validate certificate data
    if (!data || Object.keys(data).length === 0) {
      return errorResponse('No update data provided', 400);
    }

    // If participant ID is provided, check if it exists
    if (data.participantId) {
      const participant = await env.DB.prepare(
        'SELECT * FROM participants WHERE id = ?'
      ).bind(data.participantId).first();

      if (!participant) {
        return errorResponse('Participant not found', 404);
      }
    }

    // If training program ID is provided, check if it exists
    if (data.trainingProgramId) {
      const trainingProgram = await env.DB.prepare(
        'SELECT * FROM training_programs WHERE id = ?'
      ).bind(data.trainingProgramId).first();

      if (!trainingProgram) {
        return errorResponse('Training program not found', 404);
      }
    }

    // If certificate ID is provided, check if it's unique
    if (data.certificateId && data.certificateId !== certificate.certificate_id) {
      const existingCertificate = await env.DB.prepare(
        'SELECT * FROM certificates WHERE certificate_id = ?'
      ).bind(data.certificateId).first();

      if (existingCertificate) {
        return errorResponse('Certificate ID already exists', 400);
      }
    }

    // Build the update SQL dynamically based on what fields are provided
    let updateFields = [];
    let values = [];

    if (data.certificateId !== undefined) {
      updateFields.push('certificate_id = ?');
      values.push(data.certificateId);
    }

    if (data.participantId !== undefined) {
      updateFields.push('participant_id = ?');
      values.push(data.participantId);
    }

    if (data.trainingProgramId !== undefined) {
      updateFields.push('training_program_id = ?');
      values.push(data.trainingProgramId);
    }

    if (data.issueDate !== undefined) {
      updateFields.push('issue_date = ?');
      values.push(data.issueDate);
    }

    if (data.expiryDate !== undefined) {
      updateFields.push('expiry_date = ?');
      values.push(data.expiryDate);
    }

    if (data.certificatePath !== undefined) {
      updateFields.push('certificate_path = ?');
      values.push(data.certificatePath);
    }

    if (updateFields.length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    // Add the ID as the last parameter
    values.push(id);

    // Execute the update
    await env.DB.prepare(
      `UPDATE certificates SET ${updateFields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    // Get the updated certificate
    const updatedCertificate = await env.DB.prepare(`
      SELECT c.*, 
        p.full_name as participant_name, 
        tp.title as training_program_name 
      FROM certificates c 
      JOIN participants p ON c.participant_id = p.id 
      JOIN training_programs tp ON c.training_program_id = tp.id
      WHERE c.id = ?
    `).bind(id).first();

    return successResponse(updatedCertificate);
  } catch (error) {
    return errorResponse(`Failed to update certificate: ${error.message}`);
  }
}

// DELETE /api/certificates/:id - Delete a certificate
async function handleDeleteCertificate(env, id) {
  try {
    // Check if the certificate exists
    const certificate = await env.DB.prepare(
      'SELECT * FROM certificates WHERE id = ?'
    ).bind(id).first();

    if (!certificate) {
      return errorResponse('Certificate not found', 404);
    }

    // Delete the certificate
    await env.DB.prepare(
      'DELETE FROM certificates WHERE id = ?'
    ).bind(id).run();

    return successResponse({ message: `Certificate with ID ${id} has been deleted successfully` });
  } catch (error) {
    return errorResponse(`Failed to delete certificate: ${error.message}`);
  }
}

// GET /api/contacts - Get all contacts
async function handleGetContacts(env) {
  try {
    const contacts = await env.DB.prepare(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    ).all();

    return successResponse(contacts.results);
  } catch (error) {
    return errorResponse(`Failed to fetch contacts: ${error.message}`);
  }
}

// GET /api/contacts/:id - Get a specific contact
async function handleGetContact(env, id) {
  try {
    const contact = await env.DB.prepare(
      'SELECT * FROM contacts WHERE id = ?'
    ).bind(id).first();

    if (!contact) {
      return errorResponse('Contact not found', 404);
    }

    return successResponse(contact);
  } catch (error) {
    return errorResponse(`Failed to fetch contact: ${error.message}`);
  }
}

// DELETE /api/contacts/:id - Delete a contact
async function handleDeleteContact(env, id) {
  try {
    // Check if the contact exists
    const contact = await env.DB.prepare(
      'SELECT * FROM contacts WHERE id = ?'
    ).bind(id).first();

    if (!contact) {
      return errorResponse('Contact not found', 404);
    }

    // Delete the contact
    await env.DB.prepare(
      'DELETE FROM contacts WHERE id = ?'
    ).bind(id).run();

    return successResponse({ message: `Contact with ID ${id} has been deleted successfully` });
  } catch (error) {
    return errorResponse(`Failed to delete contact: ${error.message}`);
  }
}

// PUT /api/contacts/:id - Update contact status
async function handleUpdateContactStatus(env, id, data) {
  try {
    // Check if the contact exists
    const contact = await env.DB.prepare(
      'SELECT * FROM contacts WHERE id = ?'
    ).bind(id).first();

    if (!contact) {
      return errorResponse('Contact not found', 404);
    }

    // Validate status
    if (!data || !data.status) {
      return errorResponse('Status is required', 400);
    }

    // Execute the update
    await env.DB.prepare(
      'UPDATE contacts SET status = ? WHERE id = ?'
    ).bind(data.status, id).run();

    // Get the updated contact
    const updatedContact = await env.DB.prepare(
      'SELECT * FROM contacts WHERE id = ?'
    ).bind(id).first();

    return successResponse(updatedContact);
  } catch (error) {
    return errorResponse(`Failed to update contact status: ${error.message}`);
  }
}

// PUT/PATCH /api/training-programs/:id - Update a training program
async function handleUpdateTrainingProgram(env, id, data) {
  try {
    // Check if the training program exists
    const program = await env.DB.prepare(
      'SELECT * FROM training_programs WHERE id = ?'
    ).bind(id).first();

    if (!program) {
      return errorResponse('Training program not found', 404);
    }

    // Validate training program data
    if (!data || Object.keys(data).length === 0) {
      return errorResponse('No update data provided', 400);
    }

    // Build the update SQL dynamically based on what fields are provided
    let updateFields = [];
    let values = [];

    if (data.title !== undefined) {
      updateFields.push('title = ?');
      values.push(data.title);
    }

    if (data.description !== undefined) {
      updateFields.push('description = ?');
      values.push(data.description);
    }

    if (data.category !== undefined) {
      updateFields.push('category = ?');
      values.push(data.category);
    }

    if (data.duration !== undefined) {
      updateFields.push('duration = ?');
      values.push(data.duration);
    }

    // Handle slug updates with validation and uniqueness check
    if (data.slug !== undefined) {
      let slug = data.slug;
      
      // Generate slug from title if slug is empty
      if (!slug && data.title) {
        slug = generateSlug(data.title);
      }
      
      if (slug) {
        // Check if slug already exists (excluding current program)
        const slugExists = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM training_programs WHERE slug = ? AND id != ?'
        ).bind(slug, id).first();
        
        if (slugExists.count > 0) {
          // Make slug unique by adding counter
          let counter = 1;
          let originalSlug = slug;
          let uniqueSlugCheck;
          do {
            slug = `${originalSlug}-${counter}`;
            uniqueSlugCheck = await env.DB.prepare(
              'SELECT COUNT(*) as count FROM training_programs WHERE slug = ? AND id != ?'
            ).bind(slug, id).first();
            counter++;
          } while (uniqueSlugCheck.count > 0);
        }
        
        updateFields.push('slug = ?');
        values.push(slug);
      }
    }

    if (data.price !== undefined) {
      updateFields.push('price = ?');
      values.push(data.price);
    }

    if (data.online_price !== undefined) {
      updateFields.push('online_price = ?');
      values.push(data.online_price);
    }

    if (data.offline_price !== undefined) {
      updateFields.push('offline_price = ?');
      values.push(data.offline_price);
    }

    if (data.delivery_mode !== undefined) {
      updateFields.push('delivery_mode = ?');
      values.push(data.delivery_mode);
    }

    // Check for both imagePath and image_path keys to accommodate both naming conventions
    if (data.imagePath !== undefined || data.image_path !== undefined) {
      updateFields.push('image_path = ?');
      const imagePathValue = data.image_path !== undefined ? data.image_path : data.imagePath;
      values.push(imagePathValue);
      console.log('Setting image_path to:', imagePathValue);
    }

    if (updateFields.length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    // Add the ID as the last parameter
    values.push(id);

    // Execute the update
    await env.DB.prepare(
      `UPDATE training_programs SET ${updateFields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    // Get the updated training program
    const updatedProgram = await env.DB.prepare(
      'SELECT * FROM training_programs WHERE id = ?'
    ).bind(id).first();

    return successResponse(updatedProgram);
  } catch (error) {
    return errorResponse(`Failed to update training program: ${error.message}`);
  }
}

/**
 * Main Worker Handler
 */
export default {
  async fetch(request, env) {
    // Get the URL and parse the path
    const url = new URL(request.url);
    const pathname = url.pathname; // Changed from 'path' to 'pathname' for clarity
    const method = request.method;

    // Handle OPTIONS requests for CORS (preflight)
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-API-Code',
        },
      });
    }

    // API routes
    if (pathname.startsWith('/api/')) {
      // GET endpoints
      if (method === 'GET') {
        // Services
        if (pathname === '/api/services') {
          return handleGetServices(env);
        }

        if (pathname.match(/^\/api\/services\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          return handleGetService(env, id);
        }

        // Training Programs
        if (pathname === '/api/training-programs') {
          return handleGetTrainingPrograms(env);
        }

        if (pathname.match(/^\/api\/training-programs\/[\w-]+$/)) {
          const identifier = pathname.split('/').pop();
          return handleGetTrainingProgram(env, identifier);
        }

        // Participants
        if (pathname === '/api/participants') {
          // Authenticate the request for participant management
          if (!authenticateApiRequest(request)) {
            return errorResponse('Authentication failed. Invalid or missing API code.', 401);
          }
          return handleGetParticipants(env);
        }

        if (pathname.match(/^\/api\/participants\/\d+$/)) {
          // Authenticate the request for participant management
          if (!authenticateApiRequest(request)) {
            return errorResponse('Authentication failed. Invalid or missing API code.', 401);
          }
          const id = parseInt(pathname.split('/').pop());
          return handleGetParticipant(env, id);
        }

        // Certificates
        if (pathname === '/api/certificates') {
          // Authenticate the request for certificate management
          if (!authenticateApiRequest(request)) {
            return errorResponse('Authentication failed. Invalid or missing API code.', 401);
          }
          return handleGetCertificates(env);
        }

        if (pathname.match(/^\/api\/certificates\/\d+$/)) {
          // Authenticate the request for certificate management
          if (!authenticateApiRequest(request)) {
            return errorResponse('Authentication failed. Invalid or missing API code.', 401);
          }
          const id = parseInt(pathname.split('/').pop());
          return handleGetCertificate(env, id);
        }

        if (pathname.match(/^\/api\/certificates\/download\/(.+)$/)) {
          // Certificate download should be public
          // No authentication required for certificate downloads
          const certificateId = pathname.match(/^\/api\/certificates\/download\/(.+)$/)[1];
          return handleCertificateDownload(env, certificateId);
        }

        // Contacts
        if (pathname === '/api/contacts') {
          // Authenticate the request for contact management
          if (!authenticateApiRequest(request)) {
            return errorResponse('Authentication failed. Invalid or missing API code.', 401);
          }
          return handleGetContacts(env);
        }

        if (pathname.match(/^\/api\/contacts\/\d+$/)) {
          // Authenticate the request for contact management
          if (!authenticateApiRequest(request)) {
            return errorResponse('Authentication failed. Invalid or missing API code.', 401);
          }
          const id = parseInt(pathname.split('/').pop());
          return handleGetContact(env, id);
        }
      }

      // POST endpoints
      if (method === 'POST') {
        // Parse the request body
        let data;
        try {
          data = await request.json();
        } catch (error) {
          return errorResponse('Invalid JSON in request body', 400);
        }

        // Regular POST operations (no authentication required)
        if (pathname === '/api/verify-certificate') {
          return handleVerifyCertificate(env, data);
        }

        if (pathname === '/api/check-status') {
          return handleCheckParticipantStatus(env, data);
        }

        if (pathname === '/api/contact') {
          return handleContactForm(env, data);
        }

        // POST operations that create new records - require authentication
        if (pathname.includes('/create') || pathname.includes('/add')) {
          // Authenticate the request
          if (!authenticateApiRequest(request)) {
            return errorResponse('Authentication failed. Invalid or missing API code.', 401);
          }

          // Handle different create endpoints
          if (pathname === '/api/services/create') {
            return handleCreateService(env, data);
          }

          if (pathname === '/api/training-programs/create') {
            return handleCreateTrainingProgram(env, data);
          }

          if (pathname === '/api/participants/create') {
            return handleCreateParticipant(env, data);
          }

          if (pathname === '/api/certificates/create') {
            return handleCreateCertificate(env, data);
          }
        }
      }

      // DELETE operations - require authentication
      if (method === 'DELETE') {
        // Authenticate the request
        if (!authenticateApiRequest(request)) {
          return errorResponse('Authentication failed. Invalid or missing API code.', 401);
        }

        if (pathname.match(/^\/api\/services\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          return handleDeleteService(env, id);
        }

        if (pathname.match(/^\/api\/training-programs\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          return handleDeleteTrainingProgram(env, id);
        }

        if (pathname.match(/^\/api\/participants\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          return handleDeleteParticipant(env, id);
        }

        if (pathname.match(/^\/api\/certificates\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          return handleDeleteCertificate(env, id);
        }

        // Contacts
        if (pathname.match(/^\/api\/contacts\/\d+$/)) {
          const id = parseInt(pathname.split('/')[3]);
          return handleDeleteContact(env, id);
        }
      }

      // PUT/PATCH operations - require authentication
      if (method === 'PUT' || method === 'PATCH') {
        // Authenticate the request
        if (!authenticateApiRequest(request)) {
          return errorResponse('Authentication failed. Invalid or missing API code.', 401);
        }

        // Parse the request body
        let data;
        try {
          data = await request.json();
        } catch (error) {
          return errorResponse('Invalid JSON in request body', 400);
        }

        if (pathname.match(/^\/api\/services\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          return handleUpdateService(env, id, data);
        }

        if (pathname.match(/^\/api\/training-programs\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          return handleUpdateTrainingProgram(env, id, data);
        }

        if (pathname.match(/^\/api\/participants\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          return handleUpdateParticipant(env, id, data);
        }

        if (pathname.match(/^\/api\/certificates\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          return handleUpdateCertificate(env, id, data);
        }

        if (pathname.match(/^\/api\/contacts\/\d+$/)) {
          const id = parseInt(pathname.split('/')[3]);
          return handleUpdateContactStatus(env, id, data);
        }
      }

      // If no matching endpoint is found
      return errorResponse('Endpoint not found', 404);
    }

    // If not an API route, return 404
    return errorResponse('Not found', 404);
  }
};