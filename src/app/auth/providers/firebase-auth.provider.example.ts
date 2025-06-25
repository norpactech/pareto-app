/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Note: This would require Firebase SDK installation
// npm install firebase @angular/fire

// import { 
//   Auth, 
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   sendEmailVerification,
//   sendPasswordResetEmail,
//   confirmPasswordReset,
//   updatePassword,
//   User as FirebaseUser
// } from 'firebase/auth';

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

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Firebase Authentication Provider Implementation
 * 
 * This is an example implementation showing how to create
 * a new auth provider using the standard interface.
 * 
 * To use this provider:
 * 1. Install Firebase: npm install firebase @angular/fire
 * 2. Uncomment the Firebase imports above
 * 3. Add Firebase config to your environment
 * 4. Register this provider in AuthProviderFactory
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthProvider extends BaseAuthProvider {
  // private firebaseAuth: Auth;
  private config: FirebaseConfig;

  constructor() {
    super();
    // This would come from environment config
    this.config = {
      apiKey: "your-api-key",
      authDomain: "your-app.firebaseapp.com", 
      projectId: "your-project-id",
      storageBucket: "your-app.appspot.com",
      messagingSenderId: "123456789",
      appId: "your-app-id"
    };
    
    // Initialize Firebase
    // this.initializeFirebase();
  }

  // private initializeFirebase(): void {
  //   const app = initializeApp(this.config);
  //   this.firebaseAuth = getAuth(app);
  // }

  signUp(request: SignUpRequest): Observable<SignUpResponse> {
    this.setLoading(true);
    this.setError(null);

    // Example implementation (commented out since Firebase isn't installed)
    /*
    return from(createUserWithEmailAndPassword(this.firebaseAuth, request.email, request.password)).pipe(
      map(userCredential => {
        const user = userCredential.user;
        
        // Send email verification
        sendEmailVerification(user);
        
        return {
          userId: user.uid,
          needsVerification: !user.emailVerified,
          verificationDelivery: {
            destination: user.email!,
            attributeName: 'email'
          }
        };
      }),
      tap(() => this.setLoading(false)),
      catchError(error => this.handleError(error, 'signUp'))
    );
    */

    // Placeholder implementation
    return throwError(() => new AuthError(
      AuthErrorType.UNKNOWN_ERROR,
      'Firebase provider not fully implemented. Please install Firebase SDK and uncomment the implementation.'
    ));
  }

  signIn(request: SignInRequest): Observable<SignInResponse> {
    this.setLoading(true);
    this.setError(null);

    // Example implementation (commented out)
    /*
    return from(signInWithEmailAndPassword(this.firebaseAuth, request.email, request.password)).pipe(
      map(userCredential => {
        const user = userCredential.user;
        const authUser = this.mapFirebaseUserToAuthUser(user);
        
        this.updateCurrentUser(authUser);

        return {
          user: authUser,
          accessToken: await user.getIdToken(),
          idToken: await user.getIdToken()
        };
      }),
      tap(() => this.setLoading(false)),
      catchError(error => this.handleError(error, 'signIn'))
    );
    */

    return throwError(() => new AuthError(
      AuthErrorType.UNKNOWN_ERROR,
      'Firebase provider not fully implemented'
    ));
  }

  signOut(): Observable<void> {
    /*
    return from(signOut(this.firebaseAuth)).pipe(
      tap(() => {
        this.clearAuthState();
      }),
      catchError(error => this.handleError(error, 'signOut'))
    );
    */

    return of(undefined);
  }

  verifyEmail(request: EmailVerificationRequest): Observable<void> {
    // Firebase handles email verification differently
    // This would typically be handled automatically when the user clicks the link
    return of(undefined);
  }

  resendVerificationCode(request: ResendVerificationRequest): Observable<void> {
    /*
    const user = this.firebaseAuth.currentUser;
    if (user) {
      return from(sendEmailVerification(user)).pipe(
        map(() => undefined),
        catchError(error => this.handleError(error, 'resendVerificationCode'))
      );
    }
    */

    return throwError(() => new AuthError(
      AuthErrorType.UNKNOWN_ERROR,
      'No current user found'
    ));
  }

  forgotPassword(email: string): Observable<void> {
    /*
    return from(sendPasswordResetEmail(this.firebaseAuth, email)).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, 'forgotPassword'))
    );
    */

    return of(undefined);
  }

  confirmForgotPassword(confirmation: PasswordResetConfirmation): Observable<void> {
    /*
    return from(confirmPasswordReset(this.firebaseAuth, confirmation.code, confirmation.newPassword)).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error, 'confirmForgotPassword'))
    );
    */

    return of(undefined);
  }

  changePassword(request: PasswordChangeRequest): Observable<void> {
    /*
    const user = this.firebaseAuth.currentUser;
    if (user) {
      return from(updatePassword(user, request.newPassword)).pipe(
        map(() => undefined),
        catchError(error => this.handleError(error, 'changePassword'))
      );
    }
    */

    return throwError(() => new AuthError(
      AuthErrorType.UNKNOWN_ERROR,
      'No current user found'
    ));
  }

  getCurrentUser(): Observable<AuthUser | null> {
    /*
    const user = this.firebaseAuth.currentUser;
    if (user) {
      return of(this.mapFirebaseUserToAuthUser(user));
    }
    */

    return of(null);
  }

  refreshSession(): Observable<SignInResponse> {
    /*
    const user = this.firebaseAuth.currentUser;
    if (user) {
      return from(user.getIdToken(true)).pipe(
        map(token => ({
          user: this.mapFirebaseUserToAuthUser(user),
          accessToken: token,
          idToken: token
        }))
      );
    }
    */

    return throwError(() => new AuthError(
      AuthErrorType.INVALID_TOKEN,
      'No valid session found'
    ));
  }

  getAccessToken(): Observable<string | null> {
    /*
    const user = this.firebaseAuth.currentUser;
    if (user) {
      return from(user.getIdToken());
    }
    */

    return of(null);
  }

  isTokenValid(): Observable<boolean> {
    /*
    return of(!!this.firebaseAuth.currentUser);
    */

    return of(false);
  }

  // Firebase-specific error mapping
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override mapProviderError(error: any, context: string): AuthError {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/user-not-found':
        return new AuthError(AuthErrorType.USER_NOT_FOUND, 'User not found', error);
      
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password', error);
      
      case 'auth/email-already-in-use':
        return new AuthError(AuthErrorType.USER_ALREADY_EXISTS, 'Email already in use', error);
      
      case 'auth/weak-password':
        return new AuthError(AuthErrorType.PASSWORD_TOO_WEAK, 'Password is too weak', error);
      
      case 'auth/invalid-email':
        return new AuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email format', error);
      
      case 'auth/too-many-requests':
        return new AuthError(AuthErrorType.TOO_MANY_ATTEMPTS, 'Too many attempts. Please try again later.', error);
      
      default:
        return super.mapProviderError(error, context);
    }
  }

  /*
  private mapFirebaseUserToAuthUser(firebaseUser: FirebaseUser): AuthUser {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      emailVerified: firebaseUser.emailVerified,
      attributes: {
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber
      }
    };
  }
  */
}

/**
 * Usage Example:
 * 
 * To enable Firebase authentication:
 * 
 * 1. Install dependencies:
 *    npm install firebase @angular/fire
 * 
 * 2. Add to environment.ts:
 *    firebase: {
 *      apiKey: "your-api-key",
 *      authDomain: "your-project.firebaseapp.com",
 *      projectId: "your-project-id",
 *      storageBucket: "your-project.appspot.com",
 *      messagingSenderId: "123456789",
 *      appId: "your-app-id"
 *    }
 * 
 * 3. Update AuthProviderFactory:
 *    case 'firebase':
 *      return new FirebaseAuthProvider();
 * 
 * 4. Switch provider in AuthService:
 *    const config: AuthProviderConfig = {
 *      type: 'firebase',
 *      config: this.environmentService.firebase,
 *      enabled: true,
 *      primary: true
 *    };
 */
