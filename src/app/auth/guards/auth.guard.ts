/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { CognitoAuthService } from '../services/cognito-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private cognitoAuth = inject(CognitoAuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }
  private checkAuth(url: string): Observable<boolean> {
    return this.cognitoAuth.authState$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated) {
          return true;
        } else {
          // Store the attempted URL for redirecting after login
          localStorage.setItem('redirectUrl', url);
          this.router.navigate(['/auth/signin']);
          return false;
        }
      })
    );
  }
}

// Role-based guard
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private cognitoAuth = inject(CognitoAuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requiredRole = route.data['role'] as string;
    
    return this.cognitoAuth.authState$.pipe(
      take(1),
      map(authState => {
        if (!authState.isAuthenticated) {
          localStorage.setItem('redirectUrl', state.url);
          this.router.navigate(['/auth/signin']);
          return false;
        }        // Note: Cognito roles would be checked from user attributes
        // For now, we'll allow all authenticated users
        // You can implement role checking from user.attributes if needed
        if (requiredRole) {
          const userRoles = authState.user?.attributes?.['custom:roles'];
          const rolesString = typeof userRoles === 'string' ? userRoles : '';
          if (!rolesString.includes(requiredRole)) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        return true;
      })
    );
  }
}

// Guest guard (redirect authenticated users away from auth pages)
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  private cognitoAuth = inject(CognitoAuthService);
  private router = inject(Router);
  canActivate(): Observable<boolean> {
    return this.cognitoAuth.authState$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}
