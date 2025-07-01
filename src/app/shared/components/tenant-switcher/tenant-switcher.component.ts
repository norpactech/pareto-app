/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatSelectModule } from '@angular/material/select'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Subject, takeUntil, combineLatest } from 'rxjs'

import { TenantService } from '@shared/service/tenant.service'
import { TenantUserService } from '@shared/service/tenant-user.service'
import { UserService } from '@shared/service'
import { TenantStateService, TenantContext } from '@shared/state/tenant-state.service'
import { AuthService } from '../../../auth/services/auth-provider.service'
import { ITenant } from '@shared/model'

@Component({
  selector: 'app-tenant-switcher',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <!-- Show for multiple tenants -->
    <div class="tenant-switcher" *ngIf="userTenants.length > 1">
      <mat-icon class="tenant-icon" matTooltip="Switch Tenant Context">business</mat-icon>
      
      <mat-select
        [value]="currentTenant?.id"
        (selectionChange)="onTenantChange($event.value)"
        [disabled]="loading"
        class="tenant-select"
        placeholder="Select Tenant">
        
        <mat-option *ngFor="let tenant of userTenants" [value]="tenant.id">
          <div class="tenant-option">
            <span class="tenant-name">{{ tenant.name }}</span>
            <span class="tenant-id" *ngIf="showTenantIds">{{ tenant.id }}</span>
          </div>
        </mat-option>
      </mat-select>
      
      <mat-spinner 
        *ngIf="loading" 
        diameter="20" 
        class="loading-spinner">
      </mat-spinner>
    </div>
    
    <!-- Show for single tenant -->
    <div class="single-tenant-display" *ngIf="userTenants.length === 1">
      <mat-icon class="tenant-icon" matTooltip="Current Tenant">business</mat-icon>
      <span class="tenant-name">{{ userTenants[0].name }}</span>
    </div>
    
    <!-- Debug: Show loading state -->
    <div class="tenant-loading" *ngIf="loading && userTenants.length === 0">
      <mat-spinner diameter="20" class="loading-spinner"></mat-spinner>
      <span>Loading tenants...</span>
    </div>
    
    <!-- Debug: Show when no tenants found -->
    <div class="no-tenants" *ngIf="!loading && userTenants.length === 0">
      <mat-icon class="tenant-icon">business_center</mat-icon>
      <span>No tenants found</span>
    </div>
  `,
  styles: [`
    .tenant-switcher {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 8px;
      background: var(--surface);
      border: 1px solid var(--surface-300);
      min-width: 200px;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--surface-400);
      }
    }

    .single-tenant-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 8px;
      background: var(--surface-100);
      border: 1px solid var(--surface-200);
      min-width: 150px;
    }

    .tenant-icon {
      color: var(--primary-500);
      font-size: 20px;
      margin-right: 0.25rem;
    }

    .tenant-select {
      flex: 1;
      font-size: 0.9rem;

      ::ng-deep .mat-mdc-select-trigger {
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
        height: auto !important;
        min-height: auto !important;
      }

      ::ng-deep .mat-mdc-select-value {
        color: var(--text-primary);
        font-weight: 500;
      }

      ::ng-deep .mat-mdc-select-arrow {
        color: var(--text-secondary);
      }
    }

    .tenant-option {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      
      .tenant-name {
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .tenant-id {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-family: monospace;
      }
    }

    .loading-spinner {
      ::ng-deep circle {
        stroke: var(--primary-500);
      }
    }

    .tenant-loading,
    .no-tenants {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 8px;
      background: var(--surface-100);
      border: 1px dashed var(--surface-300);
      min-width: 150px;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .no-tenants {
      border-color: var(--warning-300);
      background: var(--warning-50);
      color: var(--warning-700);
    }

    // Responsive design
    @media (max-width: 768px) {
      .tenant-switcher {
        min-width: 150px;
        padding: 0.25rem;
      }
      
      .tenant-icon {
        font-size: 18px;
      }
      
      .tenant-select {
        font-size: 0.8rem;
      }
    }
  `]
})
export class TenantSwitcherComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly tenantService = inject(TenantService)
  private readonly tenantUserService = inject(TenantUserService)
  private readonly userService = inject(UserService)
  private readonly tenantStateService = inject(TenantStateService)
  private readonly authService = inject(AuthService)

  userTenants: ITenant[] = []
  currentTenant: TenantContext | null = null
  loading = false
  showTenantIds = false // Set to true in development if needed

  ngOnInit(): void {
    console.log('TenantSwitcher: Component initialized')
    this.loadUserTenants()
    this.subscribeToTenantChanges()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private loadUserTenants(): void {
    console.log('TenantSwitcher: Starting to load user tenants')
    this.loading = true
    
    // Debug: Check auth service state
    console.log('TenantSwitcher: AuthService:', this.authService)
    console.log('TenantSwitcher: Subscribing to currentUser$')
    
    // Get current user from auth service
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (currentUser) => {
          console.log('TenantSwitcher: Current user received:', currentUser)
          if (!currentUser?.email) {
            console.warn('TenantSwitcher: No current user email found for tenant loading')
            this.loading = false
            return
          }

          console.log('TenantSwitcher: Looking up application user by email:', currentUser.email)
          
          // First, look up the user in the application database by email to get the correct user ID
          this.userService.find({ email: currentUser.email })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (userResponse) => {
                console.log('TenantSwitcher: User lookup response:', userResponse)
                
                if (!userResponse.data || userResponse.data.length === 0) {
                  console.warn('TenantSwitcher: No application user found for email:', currentUser.email)
                  this.loading = false
                  return
                }
                
                const applicationUser = userResponse.data[0]
                const applicationUserId = applicationUser.id
                
                console.log('TenantSwitcher: Found application user ID:', applicationUserId, 'for Cognito user ID:', currentUser.id)
                
                // Now get tenant-user relationships using the correct application user ID
                this.tenantUserService.find({ idUser: applicationUserId })
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (response) => {
                      console.log('TenantSwitcher: Tenant-user response:', response)
                      const tenantIds = response.data.map(tu => tu.idTenant)
                      console.log('TenantSwitcher: Tenant IDs found:', tenantIds)
                      this.loadTenantDetails(tenantIds)
                    },
                    error: (error) => {
                      console.error('TenantSwitcher: Error loading user tenants:', error)
                      this.loading = false
                    }
                  })
              },
              error: (error) => {
                console.error('TenantSwitcher: Error looking up application user:', error)
                this.loading = false
              }
            })
        },
        error: (error) => {
          console.error('TenantSwitcher: Error getting current user:', error)
          this.loading = false
        }
      })
  }

  private loadTenantDetails(tenantIds: string[]): void {
    console.log('TenantSwitcher: Loading tenant details for IDs:', tenantIds)
    if (tenantIds.length === 0) {
      console.log('TenantSwitcher: No tenant IDs found')
      this.loading = false
      return
    }

    // Load tenant details for all tenant IDs
    const tenantObservables = tenantIds.map(id => this.tenantService.get(id))
    
    combineLatest(tenantObservables)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tenants) => {
          console.log('TenantSwitcher: Loaded tenant details:', tenants)
          this.userTenants = tenants.filter(t => t !== null) as ITenant[]
          console.log('TenantSwitcher: Filtered user tenants:', this.userTenants)
          
          // If no current tenant is set and we have tenants, set the first one
          if (!this.currentTenant && this.userTenants.length > 0) {
            console.log('TenantSwitcher: Setting first tenant as current:', this.userTenants[0])
            this.setCurrentTenant(this.userTenants[0])
          }
          
          this.loading = false
        },
        error: (error) => {
          console.error('TenantSwitcher: Error loading tenant details:', error)
          this.loading = false
        }
      })
  }

  private subscribeToTenantChanges(): void {
    this.tenantStateService.tenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tenant => {
        this.currentTenant = tenant
      })
  }

  onTenantChange(tenantId: string): void {
    const selectedTenant = this.userTenants.find(t => t.id === tenantId)
    if (selectedTenant) {
      this.setCurrentTenant(selectedTenant)
    }
  }

  private setCurrentTenant(tenant: ITenant): void {
    const tenantContext = {
      id: tenant.id,
      name: tenant.name
    }
    
    this.tenantStateService.setTenant(tenantContext)
    
    // Optionally store in localStorage for persistence
    localStorage.setItem('currentTenant', JSON.stringify(tenantContext))
    
    // Emit event for other components to react to tenant change
    console.log('Tenant context switched to:', tenant.name)
  }

  // Method to restore tenant from localStorage on app initialization
  static restoreTenantFromStorage(tenantStateService: TenantStateService): void {
    const storedTenant = localStorage.getItem('currentTenant')
    if (storedTenant) {
      try {
        const tenant = JSON.parse(storedTenant)
        tenantStateService.setTenant(tenant)
      } catch (error) {
        console.error('Error restoring tenant from storage:', error)
        localStorage.removeItem('currentTenant')
      }
    }
  }
}
