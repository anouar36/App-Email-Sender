// Clear localStorage to fix Chrome storage issues
const clearStorage = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Browser storage cleared successfully');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// Test API connection
const testApiConnection = async () => {
  const API_URL = 'https://app-email-sender.onrender.com';
  
  try {
    console.log('Testing API connection to:', API_URL);
    
    // Test health endpoint
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health check response:', healthData);
    
    // Test CORS
    const corsResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('CORS test status:', corsResponse.status);
    console.log('CORS headers:', corsResponse.headers);
    
    return { success: true, api: healthData };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Export for use in components
export { clearStorage, testApiConnection };
