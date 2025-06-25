/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { CognitoAuthService } from '../services/cognito-auth.service';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/user.dto';

@Injectable({
  providedIn: 'root'
})
export class ProfileCompleteGuard implements CanActivate {
  private cognitoAuth = inject(CognitoAuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkProfileComplete(state.url);
  }

  private checkProfileComplete(url: string): Observable<boolean> {
    return this.cognitoAuth.authState$.pipe(
      take(1),
      switchMap(authState => {        
        if (!authState.isAuthenticated) {
          localStorage.setItem('redirectUrl', url);
          this.router.navigate(['/auth/signin']);
          return [false];
        }
        const params: Record<string, unknown> = {
          email: authState.user?.email
        };        return this.userService.find(params).pipe(
          map(result => {

              // Check if any user profile exists
            const userProfile: User | null = result.data && result.data.length > 0 ? result.data[0] : null;
            
            if (!userProfile) {

              if (url !== '/complete-profile') {
                localStorage.setItem('redirectUrl', url);
              }
              this.router.navigate(['/complete-profile']);
              return false;
            }
            
            // Verify that the returned profile actually matches the authenticated user's email
            const authenticatedEmail = authState.user?.email?.toLowerCase();
            const profileEmail = userProfile.email?.toLowerCase();
            
            if (authenticatedEmail !== profileEmail) {
              console.warn('ProfileCompleteGuard: Email mismatch detected');
              if (url !== '/complete-profile') {
                localStorage.setItem('redirectUrl', url);
              }
              this.router.navigate(['/complete-profile']);
              return false;
            }
            

            return true;
          })
        );
      })
    );
  }
}
