/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CognitoAuthService } from '../auth/services/cognito-auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy {
  private cognitoAuth = inject(CognitoAuthService);
  isAuthenticated$: Observable<boolean>;
  private destroy$ = new Subject<void>();
  
  constructor() {
    this.isAuthenticated$ = this.cognitoAuth.authState$.pipe(
      map(state => state.isAuthenticated)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
