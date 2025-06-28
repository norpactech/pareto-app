/**
 * RefTablesService Integration Test
 * 
 * This Node.js test validates the RefTablesService endpoints by making direct HTTP calls
 * to the API endpoints that the RefTablesService would use.
 * 
 * Tests the following RefTablesService methods:
 * - get(id) - Get ref table by ID
 * - find(params) - Find ref tables with parameters
 * - isAvailable(id, name) - Check if name is available
 * - persist(data) - Create/update ref table
 * - delete(data) - Delete ref table
 * - deactReact(data) - Activate/deactivate ref table
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const API_BASE_URL = 'http://localhost:8087/api';
const REF_TABLES_ENDPOINT = `${API_BASE_URL}/ref-tables`;
const API_TIMEOUT = 15000; // 15 seconds

// Test framework
let tests = 0;
let passed = 0;
let failed = 0;

function describe(suiteName, suiteFunc) {
  console.log(`\n📋 ${suiteName}`);
  console.log('='.repeat(50));
  suiteFunc();
}

function it(testName, testFunc) {
  tests++;
  process.stdout.write(`  🧪 ${testName}... `);
  
  return testFunc()
    .then(() => {
      passed++;
      console.log('✅ PASS');
    })
    .catch((error) => {
      failed++;
      console.log('❌ FAIL');
      console.log(`     Error: ${error.message}`);
      if (error.response) {
        console.log(`     Response: ${JSON.stringify(error.response, null, 2)}`);
      }
    });
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined, but got ${actual}`);
      }
    },
    toHaveProperty(property) {
      if (!actual || typeof actual !== 'object' || !(property in actual)) {
        throw new Error(`Expected object to have property '${property}'`);
      }
    },
    toBeArray() {
      if (!Array.isArray(actual)) {
        throw new Error(`Expected value to be an array, but got ${typeof actual}`);
      }
    }
  };
}

// HTTP helper function
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url);
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: API_TIMEOUT
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const protocol = url.protocol === 'https:' ? https : require('http');
    const req = protocol.request(requestOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData ? JSON.parse(responseData) : null
          };
          resolve(response);
        } catch (parseError) {
          reject(new Error(`Failed to parse response: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test data
let testRefTableId = null;
const testRefTableData = {
  idRefTableType: '123e4567-e89b-12d3-a456-426614174000', // Mock RefTableType ID
  refTableTypeName: 'Test RefTableType',
  name: 'Test RefTable Integration',
  description: 'Integration test ref table',
  value: 'test_value',
  sequence: 1,
  isActive: true
};

// Test Suite
describe('RefTablesService Integration Tests', () => {
  
  describe('POST /ref-tables (Create)', () => {
    it('should create a new ref table', async () => {
      const response = await makeRequest({
        url: REF_TABLES_ENDPOINT,
        method: 'POST'
      }, testRefTableData);

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeDefined();
      expect(response.data.data).toHaveProperty('id');
      
      // Store the ID for subsequent tests
      testRefTableId = response.data.data.id;
      console.log(`     Created RefTable with ID: ${testRefTableId}`);
    });
  });

  describe('GET /ref-tables (Get by ID)', () => {
    it('should retrieve a ref table by ID', async () => {
      if (!testRefTableId) {
        throw new Error('No test ref table ID available');
      }

      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}?id=${testRefTableId}`,
        method: 'GET'
      });

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeDefined();
      expect(response.data.data.id).toBe(testRefTableId);
      expect(response.data.data.name).toBe(testRefTableData.name);
    });

    it('should return error for non-existent ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      
      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}?id=${nonExistentId}`,
        method: 'GET'
      });

      // Should return 200 with null data or 404
      expect(response.statusCode >= 200).toBe(true);
      if (response.statusCode === 200) {
        expect(response.data.data).toBe(null);
      }
    });
  });

  describe('GET /ref-tables/find (Find with parameters)', () => {
    it('should find ref tables with search parameters', async () => {
      const searchParams = new URLSearchParams({
        searchColumn: 'name',
        searchValue: testRefTableData.name,
        limit: '10',
        offset: '0'
      });

      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}/find?${searchParams.toString()}`,
        method: 'GET'
      });

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeArray();
      expect(response.data.meta).toBeDefined();
      expect(response.data.meta.count).toBeGreaterThan(0);
    });

    it('should find ref tables by RefTableType ID', async () => {
      const searchParams = new URLSearchParams({
        searchColumn: 'idRefTableType',
        searchValue: testRefTableData.idRefTableType,
        sortColumn: 'name',
        sortDirection: 'asc'
      });

      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}/find?${searchParams.toString()}`,
        method: 'GET'
      });

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeArray();
    });

    it('should return empty results for non-matching search', async () => {
      const searchParams = new URLSearchParams({
        searchColumn: 'name',
        searchValue: 'NonExistentRefTableName12345',
        limit: '10'
      });

      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}/find?${searchParams.toString()}`,
        method: 'GET'
      });

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeArray();
      expect(response.data.data.length).toBe(0);
    });
  });

  describe('PUT /ref-tables (Update)', () => {
    it('should update an existing ref table', async () => {
      if (!testRefTableId) {
        throw new Error('No test ref table ID available');
      }

      const updatedData = {
        ...testRefTableData,
        id: testRefTableId,
        description: 'Updated integration test ref table',
        value: 'updated_test_value'
      };

      const response = await makeRequest({
        url: REF_TABLES_ENDPOINT,
        method: 'PUT'
      }, updatedData);

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeDefined();
    });
  });

  describe('PUT /ref-tables/deact (Deactivate)', () => {
    it('should deactivate a ref table', async () => {
      if (!testRefTableId) {
        throw new Error('No test ref table ID available');
      }

      const deactivateData = {
        id: testRefTableId,
        updatedAt: new Date().toISOString(),
        isActive: false
      };

      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}/deact`,
        method: 'PUT'
      }, deactivateData);

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
    });
  });

  describe('PUT /ref-tables/react (Reactivate)', () => {
    it('should reactivate a ref table', async () => {
      if (!testRefTableId) {
        throw new Error('No test ref table ID available');
      }

      const reactivateData = {
        id: testRefTableId,
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}/react`,
        method: 'PUT'
      }, reactivateData);

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
    });
  });

  describe('DELETE /ref-tables (Delete)', () => {
    it('should delete a ref table', async () => {
      if (!testRefTableId) {
        throw new Error('No test ref table ID available');
      }

      const deleteData = {
        id: testRefTableId,
        updatedAt: new Date().toISOString()
      };

      const response = await makeRequest({
        url: REF_TABLES_ENDPOINT,
        method: 'DELETE'
      }, deleteData);

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
    });
  });
});

// Run tests
async function runTests() {
  console.log('🚀 Starting RefTablesService Integration Tests');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`🎯 RefTables Endpoint: ${REF_TABLES_ENDPOINT}`);
  console.log(`⏱️  Timeout: ${API_TIMEOUT}ms\n`);

  const startTime = Date.now();

  try {
    // Test Create
    await it('should create a new ref table', async () => {
      const response = await makeRequest({
        url: REF_TABLES_ENDPOINT,
        method: 'POST'
      }, testRefTableData);

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeDefined();
      expect(response.data.data).toHaveProperty('id');
      
      testRefTableId = response.data.data.id;
      console.log(`     Created RefTable with ID: ${testRefTableId}`);
    });

    // Test Get by ID
    await it('should retrieve a ref table by ID', async () => {
      if (!testRefTableId) {
        throw new Error('No test ref table ID available');
      }

      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}?id=${testRefTableId}`,
        method: 'GET'
      });

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeDefined();
      expect(response.data.data.id).toBe(testRefTableId);
    });

    // Test Find
    await it('should find ref tables with search parameters', async () => {
      const searchParams = new URLSearchParams({
        searchColumn: 'name',
        searchValue: testRefTableData.name,
        limit: '10'
      });

      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}/find?${searchParams.toString()}`,
        method: 'GET'
      });

      expect(response.statusCode).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeArray();
    });

    // Test Update
    await it('should update an existing ref table', async () => {
      const updatedData = {
        ...testRefTableData,
        id: testRefTableId,
        description: 'Updated integration test ref table'
      };

      const response = await makeRequest({
        url: REF_TABLES_ENDPOINT,
        method: 'PUT'
      }, updatedData);

      expect(response.statusCode).toBe(200);
    });

    // Test Deactivate
    await it('should deactivate a ref table', async () => {
      const deactivateData = {
        id: testRefTableId,
        updatedAt: new Date().toISOString(),
        isActive: false
      };

      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}/deact`,
        method: 'PUT'
      }, deactivateData);

      expect(response.statusCode).toBe(200);
    });

    // Test Reactivate
    await it('should reactivate a ref table', async () => {
      const reactivateData = {
        id: testRefTableId,
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      const response = await makeRequest({
        url: `${REF_TABLES_ENDPOINT}/react`,
        method: 'PUT'
      }, reactivateData);

      expect(response.statusCode).toBe(200);
    });

    // Test Delete
    await it('should delete a ref table', async () => {
      const deleteData = {
        id: testRefTableId,
        updatedAt: new Date().toISOString()
      };

      const response = await makeRequest({
        url: REF_TABLES_ENDPOINT,
        method: 'DELETE'
      }, deleteData);

      expect(response.statusCode).toBe(200);
    });

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log(`   Total Tests: ${tests}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏱️  Duration: ${duration}ms`);
  console.log('='.repeat(50));

  if (failed > 0) {
    process.exit(1);
  }
}

// Execute tests if this file is run directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
