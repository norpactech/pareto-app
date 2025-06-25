/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CognitoAuthService } from '../../services/cognito-auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cognitoAuth = inject(CognitoAuthService);
  private router = inject(Router);
  
  forgotPasswordForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  showResetForm = false;
  userEmail = '';
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForms();
    this.subscribeToAuthState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetPasswordForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private subscribeToAuthState(): void {
    this.cognitoAuth.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.loading = state.loading;
        this.error = state.error;
      });
  }
  // Custom password validator for Cognito password policy
  private passwordValidator(control: AbstractControl) {
    const password = control.value;
    if (!password) return null;

    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const minLength = password.length >= 8;

    const passwordValid = hasNumber && hasUpper && hasLower && hasSpecial && minLength;

    if (!passwordValid) {
      return {
        passwordPolicy: {
          hasNumber,
          hasUpper,
          hasLower,
          hasSpecial,
          minLength
        }
      };
    }

    return null;
  }

  // Custom validator to check if passwords match
  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSendResetCode(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email.trim().toLowerCase();
      this.userEmail = email;
      
      this.cognitoAuth.forgotPassword(email)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showResetForm = true;
            this.success = 'Reset code sent to your email address';
            this.error = null;
          },          error: (error: unknown) => {
            console.error('Forgot password failed:', error);
          }
        });
    } else {
      this.markFormGroupTouched(this.forgotPasswordForm);
    }
  }

  onResetPassword(): void {
    if (this.resetPasswordForm.valid) {
      const formValue = this.resetPasswordForm.value;
      
      this.cognitoAuth.confirmForgotPassword(
        this.userEmail,
        formValue.code,
        formValue.newPassword
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'Password reset successfully!';
          this.error = null;
          setTimeout(() => {
            this.router.navigate(['/auth/signin'], { 
              queryParams: { message: 'Password reset successfully. Please sign in with your new password.' }
            });
          }, 2000);
        },        error: (error: unknown) => {
          console.error('Reset password failed:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.resetPasswordForm);
    }
  }

  resendCode(): void {
    this.cognitoAuth.forgotPassword(this.userEmail)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = 'New reset code sent to your email';
          this.error = null;
        },        error: (error: unknown) => {
          console.error('Resend code failed:', error);
        }
      });
  }

  backToEmailForm(): void {
    this.showResetForm = false;
    this.error = null;
    this.success = null;
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid 6-digit verification code';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Password must be at least ${requiredLength} characters`;
      }
      if (field.errors['passwordPolicy']) {
        return this.getPasswordPolicyError(field.errors['passwordPolicy']);
      }
    }
    
    // Check for form-level password mismatch
    if (fieldName === 'confirmPassword' && formGroup.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    
    return '';
  }  private getPasswordPolicyError(policyError: Record<string, boolean>): string {
    const requirements = [];
    if (!policyError['minLength']) requirements.push('at least 8 characters');
    if (!policyError['hasNumber']) requirements.push('at least 1 number');
    if (!policyError['hasUpper']) requirements.push('at least 1 uppercase letter');
    if (!policyError['hasLower']) requirements.push('at least 1 lowercase letter');
    if (!policyError['hasSpecial']) requirements.push('at least 1 special character');
    
    return `Password must contain ${requirements.join(', ')}`;
  }

  getPasswordRequirement(requirement: string): boolean {
    const passwordControl = this.resetPasswordForm.get('newPassword');
    if (!passwordControl || !passwordControl.value) return false;

    const password = passwordControl.value;
    
    switch (requirement) {
      case 'minLength':
        return password.length >= 8;
      case 'hasNumber':
        return /[0-9]/.test(password);
      case 'hasUpper':
        return /[A-Z]/.test(password);
      case 'hasLower':
        return /[a-z]/.test(password);      case 'hasSpecial':
        return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
      default:
        return false;
    }
  }

  areAllPasswordRequirementsMet(): boolean {
    return this.getPasswordRequirement('minLength') &&
           this.getPasswordRequirement('hasNumber') &&
           this.getPasswordRequirement('hasUpper') &&
           this.getPasswordRequirement('hasLower') &&
           this.getPasswordRequirement('hasSpecial');
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      email: 'Email',
      code: 'Verification code',
      newPassword: 'New password',
      confirmPassword: 'Confirm password'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}
