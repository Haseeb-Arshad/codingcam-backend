const mongoose = require('mongoose');
const axios = require('axios');
const config = require('../src/config/environment');

async function testMongoConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('✅ MongoDB connection successful!');
    
    // Get a count of collections to verify access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in the database.`);
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  } finally {
    await mongoose.connection.close();
  }
}

async function testApiEndpoints() {
  const baseUrl = `http://localhost:${config.port}`;
  
  try {
    console.log('\nTesting API health endpoint...');
    const healthResponse = await axios.get(`${baseUrl}/health`);
    console.log(`✅ Health endpoint: ${JSON.stringify(healthResponse.data)}`);
    
    console.log('\nTesting API authentication...');
    // First create a test user if not exists
    try {
      const registerResponse = await axios.post(`${baseUrl}/api/auth/register`, {
        email: 'test@example.com',
        password: 'testPassword123',
        username: 'testuser'
      });
      console.log('✅ User registration successful:', registerResponse.data.user.username);
      var token = registerResponse.data.token;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // User exists, try to login
        const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
          email: 'test@example.com',
          password: 'testPassword123'
        });
        console.log('✅ User login successful:', loginResponse.data.user.username);
        var token = loginResponse.data.token;
      } else {
        throw error;
      }
    }
    
    // Test authenticated endpoint
    console.log('\nTesting authenticated endpoint...');
    const userResponse = await axios.get(`${baseUrl}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Authentication successful:', userResponse.data.username);
    
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('  Response:', error.response.data);
      console.error('  Status:', error.response.status);
    }
    return false;
  }
}

async function runTests() {
  console.log('=== CodingCam Backend Connection Test ===');
  
  const dbSuccess = await testMongoConnection();
  
  if (dbSuccess) {
    await testApiEndpoints();
  }
  
  console.log('\n=== Test Complete ===');
}

runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
}); 