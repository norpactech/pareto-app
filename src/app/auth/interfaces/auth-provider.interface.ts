/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Observable } from 'rxjs';

// Core authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: AuthUser | null;
}

// User information interface
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  attributes?: Record<string, string | number | boolean>;
  groups?: string[];
  roles?: string[];
}

// Sign up request interface
export interface SignUpRequest {
  email: string;
  password: string;
  attributes?: Record<string, string>;
}

// Sign up response interface
export interface SignUpResponse {
  userId: string;
  needsVerification: boolean;
  verificationDelivery?: {
    destination: string;
    attributeName: string;
  };
}

// Sign in request interface
export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Sign in response interface
export interface SignInResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  needsPasswordChange?: boolean;
  challengeType?: string;
}

// Password reset request interface
export interface PasswordResetRequest {
  email: string;
}

// Password reset confirmation interface
export interface PasswordResetConfirmation {
  email: string;
  code: string;
  newPassword: string;
}

// Email verification interface
export interface EmailVerificationRequest {
  email: string;
  code: string;
}

// Resend verification code interface
export interface ResendVerificationRequest {
  email: string;
  type: 'EMAIL' | 'SMS';
}

// Password change interface
export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

// OAuth provider configuration
export interface OAuthConfig {
  clientId: string;
  domain: string;
  redirectUri: string;
  responseType: string;
  scope: string[];
  additionalParams?: Record<string, string | number | boolean>;
}

// Main authentication provider interface
export interface IAuthProvider {
  // Core authentication state
  readonly authState$: Observable<AuthState>;
  readonly currentUser$: Observable<AuthUser | null>;
  readonly isAuthenticated$: Observable<boolean>;

  // Authentication methods
  signUp(request: SignUpRequest): Observable<SignUpResponse>;
  signIn(request: SignInRequest): Observable<SignInResponse>;
  signOut(): Observable<void>;
  
  // Email verification
  verifyEmail(request: EmailVerificationRequest): Observable<void>;
  resendVerificationCode(request: ResendVerificationRequest): Observable<void>;
  
  // Password management
  forgotPassword(email: string): Observable<void>;
  confirmForgotPassword(confirmation: PasswordResetConfirmation): Observable<void>;
  changePassword(request: PasswordChangeRequest): Observable<void>;
  
  // Session management
  getCurrentUser(): Observable<AuthUser | null>;
  refreshSession(): Observable<SignInResponse>;
  getAccessToken(): Observable<string | null>;
  
  // OAuth methods (optional - not all providers may support these)
  signInWithProvider?(provider: string): Observable<SignInResponse>;
  linkAccount?(provider: string): Observable<void>;
  unlinkAccount?(provider: string): Observable<void>;
  
  // Utility methods
  isTokenValid(): Observable<boolean>;
  validatePasswordPolicy(password: string): PasswordPolicyResult;
}

// Password policy validation result
export interface PasswordPolicyResult {
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasNumber: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasSpecial: boolean;
    [key: string]: boolean; // Allow for additional custom requirements
  };
  errors: string[];
}

// Provider-specific error types
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_VERIFICATION_CODE = 'INVALID_VERIFICATION_CODE',
  CODE_EXPIRED = 'CODE_EXPIRED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Standardized authentication error
export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string,
    public originalError?: Error | unknown,
    public metadata?: Record<string, string | number | boolean>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Provider factory interface for creating provider instances
export interface IAuthProviderFactory {
  createProvider(config: AuthProviderConfig): IAuthProvider;
  getSupportedProviders(): string[];
}

// Provider configuration interface
export interface AuthProviderConfig extends Record<string, unknown> {
  type: 'cognito' | 'firebase' | 'auth0' | 'okta' | 'custom';
  config: Record<string, unknown>; // Provider-specific configuration
  enabled: boolean;
  primary?: boolean; // Whether this is the primary provider
}
