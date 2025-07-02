/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { UserProfileComponent } from '../user-profile/user-profile.component'
import { UserService } from '@shared/service/user.service'
import { CognitoAuthService } from '../../../auth/services/cognito-auth.service'
import { IUser } from '@shared/model'
import { take, switchMap, map } from 'rxjs/operators'

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    UserProfileComponent
  ],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  private dialog = inject(MatDialog)
  private router = inject(Router)
  private userService = inject(UserService)
  private authService = inject(CognitoAuthService)
  
  // Track whether user has a profile or needs to create one
  hasProfile = false
  isLoading = true
  currentUser: IUser | null = null

  ngOnInit(): void {
    this.checkUserProfile()
  }

  private checkUserProfile(): void {
    this.isLoading = true
    
    this.authService.authState$.pipe(
      take(1),
      switchMap(authState => {
        if (!authState.isAuthenticated || !authState.user?.email) {
          return []
        }
        const params = { email: authState.user.email }
        return this.userService.find(params).pipe(
          map((result: { data: IUser[]; total: number }) => ({ result, authenticatedEmail: authState.user?.email }))
        )
      })
    ).subscribe({
      next: ({ result, authenticatedEmail }) => {
        this.isLoading = false
        
        // Check if no profile exists
        if (!result.data || result.data.length === 0) {
          console.log('ProfilePage: No profile found, showing inline form')
          this.hasProfile = false
          this.currentUser = null
          return
        }
        
        // Verify email match for additional security
        const profileEmail = result.data[0]?.email?.toLowerCase()
        const authEmail = authenticatedEmail?.toLowerCase()
        
        if (profileEmail !== authEmail) {
          console.log('ProfilePage: Email mismatch, treating as no profile. Auth:', authEmail, 'Profile:', profileEmail)
          this.hasProfile = false
          this.currentUser = null
          return
        }
        
        console.log('ProfilePage: Valid profile found for user')
        this.hasProfile = true
        this.currentUser = result.data[0]
      },
      error: (error) => {
        console.error('Error checking profile:', error)
        this.isLoading = false
        this.hasProfile = false
        this.currentUser = null
      }
    })
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
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Profile updated:', result)
        // Refresh the profile data to show the latest changes
        this.checkUserProfile()
      }
    })
  }

  onProfileCreated(result: IUser): void {
    console.log('Profile created successfully:', result)
    this.hasProfile = true
    this.currentUser = result
    // Redirect to home page after profile creation
    this.router.navigate(['/'])
  }

  onProfileCancelled(): void {
    console.log('Profile creation cancelled')
    // Redirect back to home page
    this.router.navigate(['/'])
  }

  goBack(): void {
    this.router.navigate(['/'])
  }

  formatPhoneDisplay(phone: string): string {
    if (!phone) return 'Not provided'
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    // Format as (###) ###-####
    if (digits.length === 10) {
      return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`
    }
    
    // Return original if not 10 digits or already formatted
    return phone || 'Not provided'
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Not available'
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return 'Invalid date'
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}
