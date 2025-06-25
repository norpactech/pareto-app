/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CognitoAuthService } from '../services/cognito-auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private cognitoAuth = inject(CognitoAuthService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add auth token to requests
    const authToken = this.cognitoAuth.accessToken;
    if (authToken && !this.isAuthRequest(request.url)) {
      request = this.addTokenToRequest(request, authToken);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 unauthorized errors
        if (error.status === 401 && !this.isAuthRequest(request.url)) {
          // Sign out user on 401 (token expired or invalid)
          this.cognitoAuth.signOut();
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthRequest(url: string): boolean {
    // Don't add token to authentication requests or AWS Cognito requests
    return url.includes('/auth/') || url.includes('cognito-idp') || url.includes('amazonaws.com');
  }
}
