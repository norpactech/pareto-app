# RefTablesService Integration Test

## Overview

This integration test validates the RefTablesService by making direct HTTP calls to the API endpoints that the RefTablesService would use in the Angular application.

## Prerequisites

1. **API Server Running**: The backend API server must be running on `http://localhost:8087`
2. **Database Access**: The API should have access to the database with RefTables functionality
3. **Node.js**: Node.js must be installed to run the test

## Test Coverage

The integration test covers all major RefTablesService methods:

### 📝 **CRUD Operations**
- ✅ **CREATE** - `POST /api/ref-tables` - Creates a new ref table
- ✅ **READ** - `GET /api/ref-tables?id={id}` - Retrieves ref table by ID
- ✅ **UPDATE** - `PUT /api/ref-tables` - Updates existing ref table
- ✅ **DELETE** - `DELETE /api/ref-tables` - Deletes ref table

### 🔍 **Search Operations**
- ✅ **FIND** - `GET /api/ref-tables/find` - Searches with parameters
- ✅ **SEARCH BY NAME** - Searches ref tables by name
- ✅ **SEARCH BY REF TABLE TYPE** - Searches by RefTableType ID
- ✅ **SORTING** - Tests sorting by name (asc/desc)
- ✅ **PAGINATION** - Tests limit/offset parameters

### 🔄 **State Management**
- ✅ **DEACTIVATE** - `PUT /api/ref-tables/deact` - Deactivates ref table
- ✅ **REACTIVATE** - `PUT /api/ref-tables/react` - Reactivates ref table

### 🛡️ **Error Handling**
- ✅ **NON-EXISTENT ID** - Tests behavior with invalid IDs
- ✅ **EMPTY SEARCH RESULTS** - Tests searches that return no results
- ✅ **NETWORK TIMEOUTS** - 15-second timeout handling

## Running the Test

### Method 1: Direct Node.js Execution
```bash
# Navigate to the test directory
cd src/tests/integration/services

# Run the RefTablesService integration test
node ref-tables-service.integration.js
```

### Method 2: From Project Root
```bash
# From the project root directory
node src/tests/integration/services/ref-tables-service.integration.js
```

### Method 3: Using npm script (if configured)
```bash
npm run test:integration:ref-tables
```

## Test Data

The test uses the following sample data:

```javascript
const testRefTableData = {
  idRefTableType: '123e4567-e89b-12d3-a456-426614174000', // Mock RefTableType ID
  refTableTypeName: 'Test RefTableType',
  name: 'Test RefTable Integration',
  description: 'Integration test ref table',
  value: 'test_value',
  sequence: 1,
  isActive: true
};
```

## Expected Output

```
🚀 Starting RefTablesService Integration Tests
📡 API Base URL: http://localhost:8087/api
🎯 RefTables Endpoint: http://localhost:8087/api/ref-tables
⏱️  Timeout: 15000ms

  🧪 should create a new ref table... ✅ PASS
     Created RefTable with ID: 123e4567-e89b-12d3-a456-426614174001
  🧪 should retrieve a ref table by ID... ✅ PASS
  🧪 should find ref tables with search parameters... ✅ PASS
  🧪 should update an existing ref table... ✅ PASS
  🧪 should deactivate a ref table... ✅ PASS
  🧪 should reactivate a ref table... ✅ PASS
  🧪 should delete a ref table... ✅ PASS

==================================================
📊 Test Results:
   Total Tests: 7
   ✅ Passed: 7
   ❌ Failed: 0
   ⏱️  Duration: 2847ms
==================================================
```

## Configuration

### API Endpoint
The test points to `http://localhost:8087/api/ref-tables` by default. Modify the `API_BASE_URL` constant if your API runs on a different URL:

```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

### Timeout
The default timeout is 15 seconds. Adjust if needed:

```javascript
const API_TIMEOUT = 30000; // 30 seconds
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```
   Error: Request failed: connect ECONNREFUSED 127.0.0.1:8087
   ```
   **Solution**: Ensure the API server is running on port 8087

2. **Timeout Errors**
   ```
   Error: Request timeout
   ```
   **Solution**: Increase the timeout or check API performance

3. **Invalid RefTableType ID**
   ```
   Error: Foreign key constraint violation
   ```
   **Solution**: Ensure the test `idRefTableType` exists in your database

4. **Permission Errors**
   ```
   Error: Forbidden or Unauthorized
   ```
   **Solution**: Check if the API requires authentication headers

## Integration with CI/CD

This test can be integrated into continuous integration pipelines:

```yaml
# Example GitHub Actions step
- name: Run RefTablesService Integration Tests
  run: |
    # Start API server (if not already running)
    npm run start:api &
    
    # Wait for API to be ready
    sleep 10
    
    # Run integration tests
    node src/tests/integration/services/ref-tables-service.integration.js
```

## Related Files

- **Service**: `src/app/shared/service/ref-tables.service.ts`
- **Model**: `src/app/shared/model/ref-tables.dto.ts`
- **Related Model**: `src/app/shared/model/ref-table-type.dto.ts`
- **Base Service**: `src/app/shared/service/base.service.ts`
- **Utils Using Service**: `src/app/shared/utils/table.utils.ts`

## Notes

- The test creates, modifies, and deletes test data
- Each test is independent and should not affect others
- The test uses a simple assertion framework built into the test file
- Real API responses are tested, not mocked data
- The test follows the same pattern as `user-service.integration.js`
