/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { UserService } from '../../../shared/services/user.service';
import { CognitoAuthService } from '../../../auth/services/cognito-auth.service';
import { User } from '../../../shared/models/user.dto';
import { take, switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-profile-page',
  standalone: true,  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    UserProfileComponent
  ],template: `
    <div class="profile-page-container">
      <!-- Loading state -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-card>
          <mat-card-content>
            <p>Loading your profile...</p>
          </mat-card-content>
        </mat-card>
      </div>      <!-- Profile creation form (when no profile exists) -->
      <div *ngIf="!isLoading && !hasProfile" class="profile-creation-container">
        <app-user-profile 
          (profileSaved)="onProfileCreated($event)"
          (cancelled)="onProfileCancelled()">
        </app-user-profile>
      </div>      <!-- Profile management (when profile exists) -->
      <div *ngIf="!isLoading && hasProfile && currentUser" class="profile-management-container">
        <div class="header-section">
          <h1>My Profile</h1>
          <button mat-raised-button color="primary" (click)="openProfileDialog()">
            <mat-icon>edit</mat-icon>
            Edit Profile
          </button>
        </div>

        <mat-card class="profile-info-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person</mat-icon>
              Profile Information
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="profile-details">
              <!-- Personal Information -->
              <div class="info-section">
                <h3>
                  <mat-icon>account_circle</mat-icon>
                  Personal Information
                </h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Name:</span>
                    <span class="value">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Email:</span>
                    <span class="value">{{ currentUser.email }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Phone:</span>
                    <span class="value">{{ formatPhoneDisplay(currentUser.phone) }}</span>
                  </div>
                </div>
              </div>

              <!-- Address Information -->
              <div class="info-section">
                <h3>
                  <mat-icon>location_on</mat-icon>
                  Address Information
                </h3>
                <div class="info-grid">
                  <div class="info-item full-width">
                    <span class="label">Street Address:</span>
                    <span class="value">
                      {{ currentUser.street1 }}
                      <span *ngIf="currentUser.street2">, {{ currentUser.street2 }}</span>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="label">City:</span>
                    <span class="value">{{ currentUser.city }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">State:</span>
                    <span class="value">{{ currentUser.state }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">ZIP Code:</span>
                    <span class="value">{{ currentUser.zipCode }}</span>
                  </div>
                </div>
              </div>

              <!-- Account Information -->
              <div class="info-section">
                <h3>
                  <mat-icon>info</mat-icon>
                  Account Information
                </h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Account Created:</span>
                    <span class="value">{{ formatDate(currentUser.createdAt) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Last Updated:</span>
                    <span class="value">{{ formatDate(currentUser.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Back to Dashboard
            </button>
            <button mat-raised-button color="primary" (click)="openProfileDialog()">
              <mat-icon>edit</mat-icon>
              Edit Profile
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-page-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;

      h1 {
        margin: 0;
        color: #333;
        font-weight: 500;
      }

      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }    .profile-info-card {
      mat-card-header {
        margin-bottom: 1rem;
        
        mat-card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #333;
        }
      }

      mat-card-content {
        margin-bottom: 1.5rem;
        
        .profile-details {
          .info-section {
            margin-bottom: 2rem;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            h3 {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              margin: 0 0 1rem 0;
              color: #2c5530;
              font-size: 1.1rem;
              font-weight: 500;
              border-bottom: 2px solid #e0e0e0;
              padding-bottom: 0.5rem;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 1rem;
              
              .info-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                
                &.full-width {
                  grid-column: 1 / -1;
                }
                
                .label {
                  font-weight: 500;
                  color: #666;
                  font-size: 0.875rem;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                
                .value {
                  color: #333;
                  font-size: 1rem;
                  padding: 0.5rem 0;
                  border-bottom: 1px solid #f0f0f0;
                  min-height: 1.5rem;
                  
                  &:empty::after {
                    content: 'Not provided';
                    color: #999;
                    font-style: italic;
                  }
                }
              }
            }
          }
        }
      }

      mat-card-actions {
        display: flex;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e0e0e0;
        
        button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }
    }    @media (max-width: 768px) {
      .profile-page-container {
        padding: 1rem;
      }
      
      .header-section {
        flex-direction: column;
        align-items: stretch;
        
        button {
          width: 100%;
          justify-content: center;
        }
      }
      
      .profile-info-card {
        mat-card-content {
          .profile-details {
            .info-section {
              .info-grid {
                grid-template-columns: 1fr;
                gap: 0.75rem;
                
                .info-item {
                  &.full-width {
                    grid-column: 1;
                  }
                }
              }
            }
          }
        }
        
        mat-card-actions {
          flex-direction: column;
          
          button {
            width: 100%;
            justify-content: center;
          }
        }
      }
    }
  `]
})
export class ProfilePageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(CognitoAuthService);
  
  // Track whether user has a profile or needs to create one
  hasProfile = false;
  isLoading = true;
  currentUser: User | null = null;
  ngOnInit(): void {
    this.checkUserProfile();
  }  private checkUserProfile(): void {
    this.isLoading = true;
    
    this.authService.authState$.pipe(
      take(1),
      switchMap(authState => {
        if (!authState.isAuthenticated || !authState.user?.email) {
          return [];
        }
        const params = { email: authState.user.email };
        return this.userService.find(params).pipe(
          map((result: { data: User[]; total: number }) => ({ result, authenticatedEmail: authState.user?.email }))
        );
      })
    ).subscribe({
      next: ({ result, authenticatedEmail }) => {
        this.isLoading = false;
        
        // Check if no profile exists
        if (!result.data || result.data.length === 0) {
          console.log('ProfilePage: No profile found, showing inline form');
          this.hasProfile = false;
          this.currentUser = null;
          return;
        }
        
        // Verify email match for additional security
        const profileEmail = result.data[0]?.email?.toLowerCase();
        const authEmail = authenticatedEmail?.toLowerCase();
        
        if (profileEmail !== authEmail) {
          console.log('ProfilePage: Email mismatch, treating as no profile. Auth:', authEmail, 'Profile:', profileEmail);
          this.hasProfile = false;
          this.currentUser = null;
          return;
        }
        
        console.log('ProfilePage: Valid profile found for user');
        this.hasProfile = true;
        this.currentUser = result.data[0];
      },
      error: (error) => {
        console.error('Error checking profile:', error);
        this.isLoading = false;
        this.hasProfile = false;
        this.currentUser = null;
      }
    });
  }
  openProfileDialog(): void {
    const dialogRef = this.dialog.open(UserProfileComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      height: 'auto',
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'profile-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Profile updated:', result);
        // Refresh the profile data to show the latest changes
        this.checkUserProfile();
      }
    });
  }
  onProfileCreated(result: User): void {
    console.log('Profile created successfully:', result);
    this.hasProfile = true;
    this.currentUser = result;
    // Redirect to home page after profile creation
    this.router.navigate(['/']);
  }
  onProfileCancelled(): void {
    console.log('Profile creation cancelled');
    // Redirect back to home page
    this.router.navigate(['/']);
  }
  goBack(): void {
    this.router.navigate(['/']);
  }

  formatPhoneDisplay(phone: string): string {
    if (!phone) return 'Not provided';
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as (###) ###-####
    if (digits.length === 10) {
      return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    
    // Return original if not 10 digits or already formatted
    return phone || 'Not provided';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Not available';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
