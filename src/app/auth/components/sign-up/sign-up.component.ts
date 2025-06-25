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
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cognitoAuth = inject(CognitoAuthService);
  private router = inject(Router);
  
  signUpForm!: FormGroup;
  verificationForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;
  error: string | null = null;
  showVerification = false;
  registeredUsername = '';
  codeDeliveryDestination = '';
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForms();
    this.subscribeToAuthState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }  private initializeForms(): void {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.verificationForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  private subscribeToAuthState(): void {
    this.cognitoAuth.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.loading = state.loading;
        this.error = state.error;
      });
  }  // Custom password validator for Cognito password policy
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
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }  onSignUp(): void {
    if (this.signUpForm.valid) {
      const formValue = this.signUpForm.value;
      
      // Sign up with minimal Cognito attributes (just email)
      this.cognitoAuth.signUp(
        formValue.email, // Use email as username
        formValue.password,
        formValue.email
        // No additional attributes - will be collected after auth
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.registeredUsername = formValue.email; // Store email as username
          this.codeDeliveryDestination = result.codeDeliveryDetails?.destination || formValue.email;
          this.showVerification = true;
          this.error = null;
        },        error: (error: unknown) => {
          console.error('Sign up failed:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.signUpForm);
    }
  }

  onVerifyCode(): void {
    if (this.verificationForm.valid) {
      const code = this.verificationForm.value.verificationCode;
      
      this.cognitoAuth.confirmSignUp(this.registeredUsername, code)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Redirect to sign-in page with success message
            this.router.navigate(['/auth/signin'], { 
              queryParams: { message: 'Account verified successfully. Please sign in.' }
            });
          },          error: (error: unknown) => {
            console.error('Verification failed:', error);
          }
        });
    } else {
      this.markFormGroupTouched(this.verificationForm);
    }
  }

  resendCode(): void {
    this.cognitoAuth.resendConfirmationCode(this.registeredUsername)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          // Update delivery destination if changed
          if (result.CodeDeliveryDetails?.Destination) {
            this.codeDeliveryDestination = result.CodeDeliveryDetails.Destination;
          }
        },        error: (error: unknown) => {
          console.error('Resend code failed:', error);
        }
      });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
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
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid 6-digit verification code';
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
    const passwordControl = this.signUpForm.get('password');
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
  }private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      verificationCode: 'Verification code'
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

  backToSignUp(): void {
    this.showVerification = false;
    this.error = null;
  }

  areAllPasswordRequirementsMet(): boolean {
    return this.getPasswordRequirement('minLength') &&
           this.getPasswordRequirement('hasNumber') &&
           this.getPasswordRequirement('hasUpper') &&
           this.getPasswordRequirement('hasLower') &&
           this.getPasswordRequirement('hasSpecial');
  }
}
