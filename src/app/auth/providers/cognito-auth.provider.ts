/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  GetUserCommand,
  ResendConfirmationCodeCommand,
  AuthFlowType
} from '@aws-sdk/client-cognito-identity-provider';

import { BaseAuthProvider } from './base-auth.provider';
import {
  AuthUser,
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  SignInResponse,
  EmailVerificationRequest,
  ResendVerificationRequest,
  PasswordResetConfirmation,
  PasswordChangeRequest,
  AuthError,
  AuthErrorType
} from '../interfaces/auth-provider.interface';
import { EnvironmentService } from '@shared/services';

export interface CognitoConfig {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId?: string;
  domain?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CognitoAuthProvider extends BaseAuthProvider {  private environmentService = inject(EnvironmentService);
  
  private cognitoClient!: CognitoIdentityProviderClient;
  private config: CognitoConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    super();
    const envConfig = this.environmentService.cognito;
    this.config = {
      region: envConfig.region,
      userPoolId: envConfig.userPoolId,
      userPoolWebClientId: envConfig.userPoolClientId
    };
    this.initializeCognitoClient();
    this.checkExistingSession();
  }

  private initializeCognitoClient(): void {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.config.region
    });
  }

  private checkExistingSession(): void {
    // Check for existing tokens in localStorage
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    
    if (this.accessToken) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          if (user) {
            this.updateCurrentUser(user);
          }
        },
        error: () => {
          this.clearStoredTokens();
        }
      });
    }
  }

  signUp(request: SignUpRequest): Observable<SignUpResponse> {
    this.setLoading(true);
    this.setError(null);

    const command = new SignUpCommand({
      ClientId: this.config.userPoolWebClientId,
      Username: request.email,
      Password: request.password,
      UserAttributes: [
        {
          Name: 'email',
          Value: request.email
        },
        ...(request.attributes ? Object.entries(request.attributes).map(([key, value]) => ({
          Name: key,
          Value: value
        })) : [])
      ]
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(response => ({
        userId: response.UserSub!,
        needsVerification: !response.UserConfirmed,
        verificationDelivery: response.CodeDeliveryDetails ? {
          destination: response.CodeDeliveryDetails.Destination!,
          attributeName: response.CodeDeliveryDetails.AttributeName!
        } : undefined
      })),
      tap(() => this.setLoading(false)),
      catchError(error => this.handleError(error, 'signUp'))
    );
  }

  signIn(request: SignInRequest): Observable<SignInResponse> {
    this.setLoading(true);
    this.setError(null);

    const command = new InitiateAuthCommand({
      ClientId: this.config.userPoolWebClientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: request.email,
        PASSWORD: request.password
      }
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(response => {
        if (response.AuthenticationResult) {
          const tokens = response.AuthenticationResult;
          this.accessToken = tokens.AccessToken!;
          this.refreshToken = tokens.RefreshToken!;
          
          // Store tokens
          localStorage.setItem('accessToken', this.accessToken);
          if (this.refreshToken) {
            localStorage.setItem('refreshToken', this.refreshToken);
          }

          // Parse user from ID token
          const user = this.parseUserFromIdToken(tokens.IdToken!);
          this.updateCurrentUser(user);

          return {
            user,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            idToken: tokens.IdToken
          };
        } else {
          throw new Error('Authentication failed');
        }
      }),
      tap(() => this.setLoading(false)),
      catchError(error => this.handleError(error, 'signIn'))
    );
  }

  signOut(): Observable<void> {
    const command = new GlobalSignOutCommand({
      AccessToken: this.accessToken!
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => {
        this.clearStoredTokens();
        this.clearAuthState();
      }),      catchError(() => {
        // Even if global sign out fails, clear local state
        this.clearStoredTokens();
        this.clearAuthState();
        return of(undefined);
      })
    );
  }

  verifyEmail(request: EmailVerificationRequest): Observable<void> {
    const command = new ConfirmSignUpCommand({
      ClientId: this.config.userPoolWebClientId,
      Username: request.email,
      ConfirmationCode: request.code
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, 'verifyEmail'))
    );
  }

  resendVerificationCode(request: ResendVerificationRequest): Observable<void> {
    const command = new ResendConfirmationCodeCommand({
      ClientId: this.config.userPoolWebClientId,
      Username: request.email
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, 'resendVerificationCode'))
    );
  }

  forgotPassword(email: string): Observable<void> {
    const command = new ForgotPasswordCommand({
      ClientId: this.config.userPoolWebClientId,
      Username: email
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, 'forgotPassword'))
    );
  }

  confirmForgotPassword(confirmation: PasswordResetConfirmation): Observable<void> {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.config.userPoolWebClientId,
      Username: confirmation.email,
      ConfirmationCode: confirmation.code,
      Password: confirmation.newPassword
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, 'confirmForgotPassword'))
    );
  }

  changePassword(request: PasswordChangeRequest): Observable<void> {
    if (!this.accessToken) {
      return throwError(() => new AuthError(
        AuthErrorType.INVALID_TOKEN,
        'No valid session found'
      ));
    }

    const command = new ChangePasswordCommand({
      AccessToken: this.accessToken,
      PreviousPassword: request.oldPassword,
      ProposedPassword: request.newPassword
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, 'changePassword'))
    );
  }

  getCurrentUser(): Observable<AuthUser | null> {
    if (!this.accessToken) {
      return of(null);
    }

    const command = new GetUserCommand({
      AccessToken: this.accessToken
    });

    return from(this.cognitoClient.send(command)).pipe(      map(response => {
        const attributes: Record<string, string> = {};
        response.UserAttributes?.forEach(attr => {
          if (attr.Name && attr.Value) {
            attributes[attr.Name] = attr.Value;
          }
        });return {
          id: response.Username!,
          email: attributes['email'] || '',
          emailVerified: attributes['email_verified'] === 'true',
          attributes
        };
      }),
      catchError(error => {
        console.error('Get current user failed:', error);
        return of(null);
      })
    );
  }

  refreshSession(): Observable<SignInResponse> {
    // Implementation for token refresh would go here
    // This is a simplified version
    return throwError(() => new AuthError(
      AuthErrorType.UNKNOWN_ERROR,
      'Token refresh not implemented'
    ));
  }

  getAccessToken(): Observable<string | null> {
    return of(this.accessToken);
  }

  isTokenValid(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => !!user),
      catchError(() => of(false))
    );
  }
  // Cognito-specific error mapping
  protected override mapProviderError(error: unknown, context: string): AuthError {
    const errorObject = error as { name?: string; __type?: string; code?: string; message?: string };
    const errorCode = errorObject.name || errorObject.__type || errorObject.code;
    const errorMessage = errorObject.message || 'An error occurred';

    switch (errorCode) {
      case 'UserNotFoundException':
        return new AuthError(AuthErrorType.USER_NOT_FOUND, 'User not found', error);
      
      case 'NotAuthorizedException':
        if (errorMessage.includes('Incorrect username or password')) {
          return new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password', error);
        }
        return new AuthError(AuthErrorType.PERMISSION_DENIED, 'Access denied', error);
      
      case 'UserNotConfirmedException':
        return new AuthError(AuthErrorType.EMAIL_NOT_VERIFIED, 'Email not verified', error);
      
      case 'CodeMismatchException':
        return new AuthError(AuthErrorType.INVALID_VERIFICATION_CODE, 'Invalid verification code', error);
      
      case 'ExpiredCodeException':
        return new AuthError(AuthErrorType.CODE_EXPIRED, 'Verification code has expired', error);
      
      case 'TooManyRequestsException':
        return new AuthError(AuthErrorType.TOO_MANY_ATTEMPTS, 'Too many attempts. Please try again later.', error);
      
      case 'InvalidPasswordException':
        return new AuthError(AuthErrorType.PASSWORD_TOO_WEAK, 'Password does not meet requirements', error);
      
      case 'UsernameExistsException':
        return new AuthError(AuthErrorType.USER_ALREADY_EXISTS, 'User already exists', error);
      
      default:
        return super.mapProviderError(error, context);
    }
  }

  private parseUserFromIdToken(idToken: string): AuthUser {
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email || '',
        emailVerified: payload.email_verified || false,
        attributes: payload
      };    } catch {
      throw new AuthError(
        AuthErrorType.INVALID_TOKEN,
        'Failed to parse user information from token'
      );
    }
  }

  private clearStoredTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken = null;
    this.refreshToken = null;
  }
}
