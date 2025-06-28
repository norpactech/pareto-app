#!/usr/bin/env node

/**
 * RefTablesService Integration Test Runner
 * 
 * Simple script to run the RefTablesService integration tests
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 RefTablesService Integration Test Runner');
console.log('=' .repeat(50));

try {
  // Get the path to the integration test
  const testPath = path.join(__dirname, 'ref-tables-service.integration.js');
  
  console.log(`📁 Test file: ${testPath}`);
  console.log('🔄 Starting test execution...\n');
  
  // Run the integration test
  execSync(`node "${testPath}"`, { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('\n✅ Integration tests completed successfully!');
  
} catch (error) {
  console.error('\n❌ Integration tests failed!');
  console.error('Error:', error.message);
  process.exit(1);
}
