/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from './shared/services/theme.service';
import { CognitoAuthService, CognitoAuthState, CognitoUser } from './auth/services/cognito-auth.service';
import { UserProfileComponent } from './user/components/user-profile/user-profile.component';
import { UserService } from './shared/services/user.service';
import { User } from './shared/models/user.dto';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  private cognitoAuth = inject(CognitoAuthService);
  private dialog = inject(MatDialog);
  private userService = inject(UserService);
  private router = inject(Router);

  title = 'Pareto UI Starter';
  isMenuOpen = false;
  isDarkTheme = false;
  hasProfile = false;
  authState: CognitoAuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    accessToken: null,
    idToken: null,
    refreshToken: null
  };
  get isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  get isAuthenticatedWithProfile(): boolean {
    const result = this.authState.isAuthenticated && this.hasProfile;
    console.log('AppComponent: isAuthenticatedWithProfile check - isAuthenticated:', this.authState.isAuthenticated, 'hasProfile:', this.hasProfile, 'result:', result);
    return result;
  }

  get currentUser(): CognitoUser | null {
    return this.authState.user;
  }  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });

    // Subscribe to authentication state
    this.cognitoAuth.authState$.subscribe(authState => {
      console.log('AppComponent: Auth state changed:', authState);
      this.authState = authState;
      
      // Check profile status when authentication state changes
      if (authState.isAuthenticated && authState.user?.email) {
        console.log('AppComponent: User authenticated, checking profile for:', authState.user.email);
        this.checkUserProfile(authState.user.email);
      } else {
        console.log('AppComponent: User not authenticated or no email, setting hasProfile = false');
        this.hasProfile = false;
        // Close menu when user is not authenticated
        this.isMenuOpen = false;
      }
    });    // Subscribe to route changes to recheck profile after navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // If user is authenticated and navigates to home page, recheck profile
      if (this.authState.isAuthenticated && this.authState.user?.email && 
          (event.url === '/' || event.url === '/home')) {
        console.log('AppComponent: Navigation to home detected, rechecking profile after short delay');
        // Add a small delay to ensure any profile creation has completed
        setTimeout(() => {
          this.checkUserProfile(this.authState.user!.email);
        }, 500);
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  // Close menu conditionally - only for unauthenticated users or mobile devices
  closeMenuConditionally() {
    // Always close for unauthenticated users
    if (!this.isAuthenticated) {
      this.closeMenu();
      return;
    }
    
    // For authenticated users, only close on mobile/tablet
    if (window.innerWidth <= 767) {
      this.closeMenu();
    }
    // On desktop, keep menu open for authenticated users
  }

  // Close menu only on mobile/tablet when clicking overlay
  closeMenuOnOverlay() {
    // Only close if screen is mobile/tablet size
    if (window.innerWidth <= 767) {
      this.closeMenu();
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
  openUserProfile(): void {
    const dialogRef = this.dialog.open(UserProfileComponent, {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      height: 'auto',
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'profile-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User profile updated:', result);
      }
    });
  }

  signOut(): void {
    this.cognitoAuth.signOut().subscribe({
      next: () => {
        this.closeMenu();
        console.log('User signed out successfully');
      },
      error: (error) => {
        console.error('Sign out error:', error);
        this.closeMenu();
      }
    });
  }
  private checkUserProfile(email: string): void {
    console.log('AppComponent: Checking profile for email:', email);
    const params = { email: email };
    this.userService.find(params).subscribe({
      next: (result: { data: User[]; total: number }) => {
        console.log('AppComponent: Profile check result:', result);
        // Check if any user profile exists
        const userProfile = result.data && result.data.length > 0 ? result.data[0] : null;
          if (!userProfile) {
          console.log('AppComponent: No profile found');
          this.hasProfile = false;
          this.isMenuOpen = false; // Close menu when no profile
          return;
        }
        
        // Verify that the returned profile actually matches the authenticated user's email
        const authenticatedEmail = email.toLowerCase();
        const profileEmail = userProfile.email?.toLowerCase();
          if (authenticatedEmail !== profileEmail) {
          console.warn('AppComponent: Email mismatch detected - auth:', authenticatedEmail, 'profile:', profileEmail);
          this.hasProfile = false;
          this.isMenuOpen = false; // Close menu on email mismatch
          return;
        }        console.log('AppComponent: Profile found and verified, setting hasProfile = true');
        this.hasProfile = true;
        
        // Open the hamburger menu by default when user has a profile
        console.log('AppComponent: Profile verified, opening hamburger menu by default');
        this.isMenuOpen = true;
      },      error: (error) => {
        console.error('Error checking user profile:', error);
        this.hasProfile = false;
        this.isMenuOpen = false; // Close menu on error
      }
    });
  }
}
