/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil, take, switchMap } from 'rxjs';
import { UserService } from '@shared/services';
import { User, UpdateUserRequest } from '@shared/models';
import { IPersistResponse } from '@shared/services/model';
import { CognitoAuthService } from '../../../auth/services/cognito-auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<UserProfileComponent>, { optional: true });
  private snackBar = inject(MatSnackBar);
  private authService = inject(CognitoAuthService);
  private router = inject(Router);

  @Output() profileSaved = new EventEmitter<User>();
  @Output() cancelled = new EventEmitter<void>();

  profileForm: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  isSaving = false;
  private destroy$ = new Subject<void>();
  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
      street1: ['', [Validators.required, Validators.minLength(5)]],
      street2: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatPhoneNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove all non-digits
    
    // Limit to 10 digits
    value = value.substring(0, 10);
    
    // Format as ###-###-####
    if (value.length >= 6) {
      value = `${value.substring(0, 3)}-${value.substring(3, 6)}-${value.substring(6)}`;
    } else if (value.length >= 3) {
      value = `${value.substring(0, 3)}-${value.substring(3)}`;
    }
    
    // Update the form control value
    this.profileForm.get('phone')?.setValue(value, { emitEvent: false });
    
    // Update the input display value
    input.value = value;
  }

  private formatPhoneForDisplay(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as ###-###-####
    if (digits.length === 10) {
      return `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    
    // Return original if not 10 digits
    return phone;
  }

  private loadCurrentUser(): void {
    this.isLoading = true;
    
    // Get current user email from auth service
    this.authService.authState$.pipe(
      take(1),
      switchMap(authState => {
        if (!authState.isAuthenticated || !authState.user?.email) {
          throw new Error('User not authenticated');
        }
        const params = { email: authState.user.email };
        return this.userService.find(params);
      })
    ).subscribe({
      next: (result) => {
        const user = result.data && result.data.length > 0 ? result.data[0] : null;
        this.currentUser = user;        if (user) {
          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: this.formatPhoneForDisplay(user.phone),
            street1: user.street1,
            street2: user.street2,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode
          });
          // Email is always disabled (read-only)
          this.profileForm.get('email')?.disable();
        } else {
          // New user - pre-populate email from Cognito
          this.authService.authState$.pipe(take(1)).subscribe(authState => {
            if (authState.user?.email) {
              this.profileForm.patchValue({ email: authState.user.email });
              this.profileForm.get('email')?.disable();
            }
          });
        }
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading user:', error);
        this.showError('Failed to load user profile');
        this.isLoading = false;
      }
    });
  }  onSave(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;      if (this.currentUser) {        // Update existing user - use original updatedAt for soft locking
        const updateData: UpdateUserRequest = {
          ...this.profileForm.value,
          id: this.currentUser.id,
          email: this.profileForm.get('email')?.value || this.currentUser.email,
          updatedAt: this.currentUser.updatedAt || this.currentUser.createdAt, // Use original timestamp for soft locking, fallback to createdAt
          updatedBy: this.currentUser.email
        };

        console.log('Sending update data to API (with original updatedAt for soft locking):', updateData);
        console.log('Original updatedAt from loaded record:', this.currentUser.updatedAt);
        console.log('Timestamp being sent for soft locking:', updateData.updatedAt);
        this.userService.persist(updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.showSuccess('Profile updated successfully');
              this.handleSaveSuccess(response);
            },
            error: (error: unknown) => {
              console.error('Error updating profile:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
              this.showError(errorMessage);
              this.isSaving = false;
            }
          });
      } else {
        // Create new user profile
        const createData = {
          ...this.profileForm.value,
          email: this.profileForm.get('email')?.value, // Ensure email is included
          createdAt: new Date(),
          updatedAt: new Date()
        };        // Get the current user email for createdBy/updatedBy
        this.authService.authState$.pipe(take(1)).subscribe(authState => {
          if (authState.user?.email) {
            createData.createdBy = authState.user.email;
            createData.updatedBy = authState.user.email;
          }
        });

        console.log('Sending create data to API:', createData);
        this.userService.persist(createData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.showSuccess('Profile created successfully');
              this.handleSaveSuccess(response);
            },
            error: (error: unknown) => {
              console.error('Error creating profile:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
              this.showError(errorMessage);
              this.isSaving = false;
            }
          });
      }
    } else {
      this.markFormGroupTouched();
    }
  }  private handleSaveSuccess(response: IPersistResponse): void {
    this.isSaving = false;
    
    // Emit event for parent component - pass the current user with updates
    const updatedUser: User = {
      ...this.currentUser,
      ...this.profileForm.value,
      id: response.id || this.currentUser?.id
    } as User;
    
    this.profileSaved.emit(updatedUser);
    
    // Close dialog if in dialog mode
    if (this.dialogRef) {
      this.dialogRef.close(updatedUser);    } else {
      // If inline mode, redirect to home page
      this.router.navigate(['/']);
    }
  }

  onCancel(): void {
    // Emit event for parent component
    this.cancelled.emit();
    
    // Close dialog if in dialog mode
    if (this.dialogRef) {
      this.dialogRef.close();    } else {
      // If inline mode, redirect back to home
      this.router.navigate(['/']);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      const minLengthError = control.errors?.['minlength'] as { requiredLength?: number };
      return `${this.getFieldDisplayName(fieldName)} must be at least ${minLengthError?.requiredLength || 2} characters`;
    }    if (control?.hasError('pattern')) {
      if (fieldName === 'phone') {
        return 'Please enter a valid phone number (e.g., 555-123-4567)';
      }
      if (fieldName === 'zipCode') {
        return 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
      }
      return `Please enter a valid ${this.getFieldDisplayName(fieldName).toLowerCase()}`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone number',
      street1: 'Street address',
      street2: 'Street address line 2',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP code'
    };
    return displayNames[fieldName] || fieldName;
  }
}
