/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class TenantStateService {
  private tenantSubject = new BehaviorSubject<{ id: string; name: string } | null>(null)
  tenant$ = this.tenantSubject.asObservable()

  setTenant(tenant: { id: string; name: string }) {
    this.tenantSubject.next(tenant)
  }

  getTenant() {
    return this.tenantSubject.value
  }
}
