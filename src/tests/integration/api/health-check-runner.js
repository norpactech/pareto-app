/**
 * Simple Health Check Test Runner
 * 
 * This script tests the health endpoint of your API server
 * Expected response: { status: 'OK' }
 */

const https = require('https');
const http = require('http');

// Configuration from environment
const API_BASE_URL = 'https://dev.api.paretofactory.com';
const HEALTH_ENDPOINT = `${API_BASE_URL}/health`;
const API_TIMEOUT = 5000; 

console.log('🏥 Health Check Test');
console.log('===================');
console.log(`🔗 Health Endpoint: ${HEALTH_ENDPOINT}`);
console.log(`⏱️  Timeout: ${API_TIMEOUT}ms`);
console.log('📋 Expected Response: { status: "OK" }');
console.log('');

// Helper function to make HTTP request
function makeHealthRequest() {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(HEALTH_ENDPOINT);
    const requestModule = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: API_TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = requestModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            statusText: res.statusMessage,
            data: data ? JSON.parse(data) : null,
            rawData: data,
            headers: res.headers
          };
          resolve(result);
        } catch (parseError) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            data: null,
            rawData: data,
            headers: res.headers,
            parseError: parseError.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        error: error.message,
        code: error.code,
        type: 'network_error'
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        code: 'TIMEOUT',
        type: 'timeout_error'
      });
    });

    req.end();
  });
}

// Main health check test
async function runHealthCheck() {
  console.log('🚀 Starting Health Check Test...\n');
  
  try {
    console.log('🔍 Sending GET request to health endpoint...');
    const response = await makeHealthRequest();
    
    console.log('✅ Health endpoint responded');
    console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log('✅ HTTP 200 OK - Server is responding');
      
      if (response.data) {
        console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));
        
        // Check if response matches expected format
        if (response.data.status === 'OK') {
          console.log('🎉 SUCCESS: Health check passed!');
          console.log('✅ API returned expected response: { status: "OK" }');
          return true;
        } else {
          console.log('⚠️ WARNING: Unexpected response format');
          console.log('💡 Expected: { status: "OK" }');
          console.log('💡 Received:', response.data);
          return false;
        }
      } else {
        console.log('⚠️ WARNING: No JSON response data');
        console.log('💡 Raw response:', response.rawData);
        
        if (response.parseError) {
          console.log('🚫 JSON Parse Error:', response.parseError);
        }
        return false;
      }
    } else {
      console.log('❌ FAILED: Non-200 HTTP status');
      console.log('📄 Response:', response.rawData || 'No response body');
      return false;
    }
    
  } catch (error) {
    console.log('❌ FAILED: Health check failed');
    console.log(`🚫 Error: ${error.error || error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Connection refused - API server is not running');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Host not found - check your network/URL');
    } else if (error.code === 'TIMEOUT') {
      console.log('💡 Request timeout - server may be slow or unresponsive');
    }
    
    return false;
  }
}

// Execute the health check
runHealthCheck().then(success => {
  console.log('\n' + '='.repeat(40));
  console.log('📈 HEALTH CHECK SUMMARY');
  console.log('='.repeat(40));
  
  if (success) {
    console.log('🎉 HEALTH CHECK PASSED');
    console.log('✅ Your API health endpoint is working correctly');
    console.log('✅ Returns expected response: { status: "OK" }');
  } else {
    console.log('❌ HEALTH CHECK FAILED');
    console.log('⚠️  Your API health endpoint needs attention');
  }
  
  console.log(`\n🔗 Tested Endpoint: ${HEALTH_ENDPOINT}`);
  console.log('💡 Make sure your API server is running and has a /health endpoint');
  console.log('📋 The /health endpoint should return: { status: "OK" }');
  
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Unexpected error during health check:', error);
  process.exit(1);
});
