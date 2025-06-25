/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { 
  IAuthProvider, 
  AuthState, 
  AuthUser, 
  SignUpRequest, 
  SignUpResponse, 
  SignInRequest, 
  SignInResponse,
  EmailVerificationRequest,
  ResendVerificationRequest,
  PasswordResetConfirmation,
  PasswordChangeRequest,
  PasswordPolicyResult,
  AuthError,
  AuthErrorType
} from '../interfaces/auth-provider.interface';

@Injectable()
export abstract class BaseAuthProvider implements IAuthProvider {
  protected authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    loading: false,
    error: null,
    user: null
  });

  protected currentUserSubject = new BehaviorSubject<AuthUser | null>(null);

  // Public observables
  readonly authState$ = this.authStateSubject.asObservable();
  readonly currentUser$ = this.currentUserSubject.asObservable();  readonly isAuthenticated$ = this.authStateSubject.pipe(
    map((state: AuthState) => state.isAuthenticated)
  );

  // Abstract methods that must be implemented by concrete providers
  abstract signUp(request: SignUpRequest): Observable<SignUpResponse>;
  abstract signIn(request: SignInRequest): Observable<SignInResponse>;
  abstract signOut(): Observable<void>;
  abstract verifyEmail(request: EmailVerificationRequest): Observable<void>;
  abstract resendVerificationCode(request: ResendVerificationRequest): Observable<void>;
  abstract forgotPassword(email: string): Observable<void>;
  abstract confirmForgotPassword(confirmation: PasswordResetConfirmation): Observable<void>;
  abstract changePassword(request: PasswordChangeRequest): Observable<void>;
  abstract getCurrentUser(): Observable<AuthUser | null>;
  abstract refreshSession(): Observable<SignInResponse>;
  abstract getAccessToken(): Observable<string | null>;
  abstract isTokenValid(): Observable<boolean>;

  // Common utility methods
  protected updateAuthState(updates: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    const newState = { ...currentState, ...updates };
    this.authStateSubject.next(newState);
  }

  protected updateCurrentUser(user: AuthUser | null): void {
    this.currentUserSubject.next(user);
    this.updateAuthState({ 
      user, 
      isAuthenticated: !!user 
    });
  }

  protected setLoading(loading: boolean): void {
    this.updateAuthState({ loading });
  }

  protected setError(error: string | null): void {
    this.updateAuthState({ error });
  }
  protected handleError(error: unknown, context: string): Observable<never> {
    console.error(`Auth error in ${context}:`, error);
    
    let authError: AuthError;
    
    if (error instanceof AuthError) {
      authError = error;
    } else {
      // Convert provider-specific errors to standardized errors
      authError = this.mapProviderError(error, context);
    }

    this.setError(authError.message);
    this.setLoading(false);
    
    return throwError(() => authError);
  }

  // Default password policy validation (can be overridden)
  validatePasswordPolicy(password: string): PasswordPolicyResult {
    const requirements = {
      minLength: password.length >= 8,
      hasNumber: /[0-9]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };

    const isValid = Object.values(requirements).every(req => req);
    
    const errors: string[] = [];
    if (!requirements.minLength) errors.push('Password must be at least 8 characters long');
    if (!requirements.hasNumber) errors.push('Password must contain at least one number');
    if (!requirements.hasUpper) errors.push('Password must contain at least one uppercase letter');
    if (!requirements.hasLower) errors.push('Password must contain at least one lowercase letter');
    if (!requirements.hasSpecial) errors.push('Password must contain at least one special character');

    return {
      isValid,
      requirements,
      errors
    };
  }
  // Provider-specific error mapping (should be overridden by concrete implementations)
  protected mapProviderError(error: unknown, context: string): AuthError {
    // Default error mapping - providers should override this
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = String((error as { message: unknown }).message);
      if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        return new AuthError(
          AuthErrorType.NETWORK_ERROR,
          'Network connection error. Please check your internet connection.',
          error
        );
      }
    }

    return new AuthError(
      AuthErrorType.UNKNOWN_ERROR,
      error && typeof error === 'object' && 'message' in error 
        ? String((error as { message: unknown }).message)
        : 'An unexpected error occurred',
      error,
      { context }
    );
  }

  // Helper method to clear all auth state
  protected clearAuthState(): void {
    this.updateCurrentUser(null);
    this.updateAuthState({
      isAuthenticated: false,
      loading: false,
      error: null,
      user: null
    });
  }

  // Helper method to validate email format
  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper method to sanitize user input
  protected sanitizeInput(input: string): string {
    return input.trim().toLowerCase();
  }
}
