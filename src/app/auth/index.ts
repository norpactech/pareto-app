/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

// Auth Provider Interfaces
export * from './interfaces/auth-provider.interface';

// Base Provider
export * from './providers/base-auth.provider';

// Concrete Providers
export { CognitoAuthProvider } from './providers/cognito-auth.provider';

// Services
export * from './services/auth-provider.service';

// Legacy services (for backward compatibility during migration)
export { CognitoAuthService } from './services/cognito-auth.service';
