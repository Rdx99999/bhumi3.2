/**
 * Test script for Bhumi Consultancy Cloudflare Worker
 * 
 * This script provides test cases for the various API endpoints.
 * You can run these tests using Miniflare (a local development environment for Cloudflare Workers).
 * 
 * To run: npm install -g miniflare && miniflare --modules worker.js --d1 DB
 */

// Test data
const testCertificateVerification = {
  certificateId: 'BHM23051501',
  participantName: 'John Doe'
};

const testStatusCheck = {
  participantId: 'BHM-P-2023001'
};

const testStatusCheckEmail = {
  email: 'john.doe@example.com'
};

const testContactForm = {
  name: 'Test User',
  email: 'test.user@example.com',
  phone: '+911234567890',
  subject: 'Test Subject',
  message: 'This is a test message.'
};

// Test data for authenticated endpoints
const API_CODE = '7291826614';

const testCreateService = {
  title: 'New Test Service',
  description: 'This is a test service created via API',
  icon: 'icon-test',
  features: ['Feature 1', 'Feature 2', 'Feature 3']
};

const testCreateTrainingProgram = {
  title: 'New Test Training Program',
  description: 'This is a test training program created via API',
  category: 'Test Category',
  duration: '1 day',
  price: 299.99
};

const testUpdateService = {
  title: 'Updated Test Service',
  description: 'This service was updated via API'
};

const testUpdateTrainingProgram = {
  title: 'Updated Test Training Program',
  price: 399.99
};

// Helper function to make API requests
async function makeRequest(url, method = 'GET', body = null, authenticate = false) {
  const requestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // Add authentication header if required
  if (authenticate) {
    requestInit.headers['X-API-Code'] = API_CODE;
  }
  
  if (body) {
    requestInit.body = JSON.stringify(body);
  }
  
  const request = new Request(url, requestInit);
  const response = await worker.fetch(request, env);
  
  return await response.json();
}

// Tests
async function runTests() {
  console.log('-------------- Running API Tests --------------');
  
  try {
    // Test GET services
    console.log('\n1. Testing GET /api/services');
    const servicesResponse = await makeRequest('http://localhost/api/services');
    console.log('Response:', JSON.stringify(servicesResponse, null, 2));
    
    // Test GET training programs
    console.log('\n2. Testing GET /api/training-programs');
    const trainingResponse = await makeRequest('http://localhost/api/training-programs');
    console.log('Response:', JSON.stringify(trainingResponse, null, 2));
    
    // Test GET specific training program
    console.log('\n3. Testing GET /api/training-programs/1');
    const programResponse = await makeRequest('http://localhost/api/training-programs/1');
    console.log('Response:', JSON.stringify(programResponse, null, 2));
    
    // Test POST verify certificate
    console.log('\n4. Testing POST /api/verify-certificate');
    const verifyResponse = await makeRequest(
      'http://localhost/api/verify-certificate',
      'POST',
      testCertificateVerification
    );
    console.log('Response:', JSON.stringify(verifyResponse, null, 2));
    
    // Test POST check status by participant ID
    console.log('\n5. Testing POST /api/check-status (with participant ID)');
    const statusResponse = await makeRequest(
      'http://localhost/api/check-status',
      'POST',
      testStatusCheck
    );
    console.log('Response:', JSON.stringify(statusResponse, null, 2));
    
    // Test POST check status by email
    console.log('\n6. Testing POST /api/check-status (with email)');
    const statusEmailResponse = await makeRequest(
      'http://localhost/api/check-status',
      'POST',
      testStatusCheckEmail
    );
    console.log('Response:', JSON.stringify(statusEmailResponse, null, 2));
    
    // Test POST contact form
    console.log('\n7. Testing POST /api/contact');
    const contactResponse = await makeRequest(
      'http://localhost/api/contact',
      'POST',
      testContactForm
    );
    console.log('Response:', JSON.stringify(contactResponse, null, 2));
    
    // Test GET certificate download
    console.log('\n8. Testing GET /api/certificate/BHM23051501/download');
    const certificateResponse = await makeRequest('http://localhost/api/certificate/BHM23051501/download');
    console.log('Response:', JSON.stringify(certificateResponse, null, 2));
    
    // ---------------------- Authenticated Endpoint Tests ----------------------
    
    // Test POST create service without authentication (should fail)
    console.log('\n9. Testing POST /api/services/create without authentication (should fail)');
    const createServiceNoAuthResponse = await makeRequest(
      'http://localhost/api/services/create',
      'POST',
      testCreateService,
      false
    );
    console.log('Response:', JSON.stringify(createServiceNoAuthResponse, null, 2));
    
    // Test POST create service with authentication
    console.log('\n10. Testing POST /api/services/create with authentication');
    const createServiceResponse = await makeRequest(
      'http://localhost/api/services/create',
      'POST',
      testCreateService,
      true
    );
    console.log('Response:', JSON.stringify(createServiceResponse, null, 2));
    
    // Store the newly created service ID for later use in update and delete
    let createdServiceId = null;
    if (createServiceResponse.success && createServiceResponse.data && createServiceResponse.data.id) {
      createdServiceId = createServiceResponse.data.id;
    }
    
    // Test POST create training program with authentication
    console.log('\n11. Testing POST /api/training-programs/create with authentication');
    const createTrainingResponse = await makeRequest(
      'http://localhost/api/training-programs/create',
      'POST',
      testCreateTrainingProgram,
      true
    );
    console.log('Response:', JSON.stringify(createTrainingResponse, null, 2));
    
    // Store the newly created training program ID for later use in update and delete
    let createdTrainingId = null;
    if (createTrainingResponse.success && createTrainingResponse.data && createTrainingResponse.data.id) {
      createdTrainingId = createTrainingResponse.data.id;
    }
    
    // Only run update and delete tests if we successfully created new records
    if (createdServiceId) {
      // Test PUT update service with authentication
      console.log(`\n12. Testing PUT /api/services/${createdServiceId} with authentication`);
      const updateServiceResponse = await makeRequest(
        `http://localhost/api/services/${createdServiceId}`,
        'PUT',
        testUpdateService,
        true
      );
      console.log('Response:', JSON.stringify(updateServiceResponse, null, 2));
      
      // Test DELETE service with authentication
      console.log(`\n14. Testing DELETE /api/services/${createdServiceId} with authentication`);
      const deleteServiceResponse = await makeRequest(
        `http://localhost/api/services/${createdServiceId}`,
        'DELETE',
        null,
        true
      );
      console.log('Response:', JSON.stringify(deleteServiceResponse, null, 2));
    }
    
    if (createdTrainingId) {
      // Test PATCH update training program with authentication
      console.log(`\n13. Testing PATCH /api/training-programs/${createdTrainingId} with authentication`);
      const updateTrainingResponse = await makeRequest(
        `http://localhost/api/training-programs/${createdTrainingId}`,
        'PATCH',
        testUpdateTrainingProgram,
        true
      );
      console.log('Response:', JSON.stringify(updateTrainingResponse, null, 2));
      
      // Test DELETE training program with authentication
      console.log(`\n15. Testing DELETE /api/training-programs/${createdTrainingId} with authentication`);
      const deleteTrainingResponse = await makeRequest(
        `http://localhost/api/training-programs/${createdTrainingId}`,
        'DELETE',
        null,
        true
      );
      console.log('Response:', JSON.stringify(deleteTrainingResponse, null, 2));
    }
    
    console.log('\n-------------- All Tests Completed --------------');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run tests
runTests();