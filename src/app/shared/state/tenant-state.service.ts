/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

export interface TenantContext {
  id: string
  name: string
}

@Injectable({
  providedIn: 'root',
})
export class TenantStateService {
  private tenantSubject = new BehaviorSubject<TenantContext | null>(null)
  tenant$ = this.tenantSubject.asObservable()

  setTenant(tenant: TenantContext | null) {
    this.tenantSubject.next(tenant)
    
    // Store in localStorage for persistence across sessions
    if (tenant) {
      localStorage.setItem('currentTenant', JSON.stringify(tenant))
    } else {
      localStorage.removeItem('currentTenant')
    }
  }

  getTenant(): TenantContext | null {
    return this.tenantSubject.value
  }

  clearTenant() {
    this.setTenant(null)
  }

  // Restore tenant from localStorage on app initialization
  restoreTenantFromStorage() {
    const storedTenant = localStorage.getItem('currentTenant')
    if (storedTenant) {
      try {
        const tenant = JSON.parse(storedTenant)
        this.tenantSubject.next(tenant) // Don't trigger storage again
      } catch (error) {
        console.error('Error restoring tenant from storage:', error)
        localStorage.removeItem('currentTenant')
      }
    }
  }

  // Get tenant ID for API calls
  getCurrentTenantId(): string | null {
    return this.tenantSubject.value?.id || null
  }
}
