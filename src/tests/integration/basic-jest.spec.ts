/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

/**
 * Simple test to verify Jest is working
 */

describe('Basic Jest Test', () => {
  it('should run a basic test', () => {
    console.log('✅ Basic Jest test is running');
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    console.log('✅ Async test is running');
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
