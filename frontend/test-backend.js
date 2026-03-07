/**
 * Test Backend Connection
 * 
 * Run this to test if your backend API is accessible
 * Usage: node test-backend.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function testConnection() {
  console.log('🔍 Testing backend connection...\n');
  console.log(`API URL: ${API_URL}\n`);

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL.replace('/api', '')}/api/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }

    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
    console.log();

    // Test invalid login (should fail gracefully)
    console.log('2. Testing auth endpoint (expected to fail)...');
    try {
      const authResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'wrongpassword',
        }),
      });

      const authData = await authResponse.json();
      
      if (authResponse.ok) {
        console.log('⚠️  Login succeeded (unexpected):', authData);
      } else {
        console.log('✅ Auth endpoint working (returned error as expected):', authData);
      }
    } catch (error) {
      console.log('❌ Auth endpoint failed:', error.message);
    }

    console.log('\n✅ Backend is accessible!\n');
    console.log('Next steps:');
    console.log('1. Start the backend: cd backend && npm start');
    console.log('2. Start the frontend: cd frontend && npm run dev');
    console.log('3. Open http://localhost:3000 in your browser');

  } catch (error) {
    console.error('\n❌ Backend connection failed!');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the backend is running on port 5000');
    console.log('2. Check if the backend URL is correct in .env.local');
    console.log('3. Verify CORS is configured in the backend');
    console.log('4. Run: cd backend && npm start');
  }
}

testConnection();
