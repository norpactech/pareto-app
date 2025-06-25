/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  private router = inject(Router);

  getFormTitle(): string {
    const url = this.router.url;
    
    if (url.includes('signin')) {
      return 'Sign In';
    } else if (url.includes('signup')) {
      return 'Sign Up';
    } else if (url.includes('forgot-password')) {
      return 'Forgot Password';
    } else if (url.includes('reset-password')) {
      return 'Reset Password';
    } else if (url.includes('verify-email')) {
      return 'Verify Email';
    } else {
      return 'Authentication';
    }
  }
}
