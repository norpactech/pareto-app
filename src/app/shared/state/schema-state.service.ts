/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

export interface SchemaContext {
  id: string
  name: string
  tenantId: string
}

@Injectable({
  providedIn: 'root'
})
export class SchemaStateService {
  private readonly schemaSubject = new BehaviorSubject<SchemaContext | null>(null)
  
  /**
   * Observable for the current schema context
   */
  public readonly schema$ = this.schemaSubject.asObservable()

  /**
   * Get the current schema context
   */
  get currentSchema(): SchemaContext | null {
    return this.schemaSubject.value
  }

  /**
   * Set the current schema context
   */
  setSchema(schema: SchemaContext | null): void {
    console.log('SchemaStateService: Setting schema context:', schema)
    this.schemaSubject.next(schema)
    
    // Persist to localStorage
    if (schema) {
      localStorage.setItem('currentSchema', JSON.stringify(schema))
    } else {
      localStorage.removeItem('currentSchema')
    }
  }

  /**
   * Clear the current schema context
   */
  clearSchema(): void {
    console.log('SchemaStateService: Clearing schema context')
    this.setSchema(null)
  }

  /**
   * Restore schema context from localStorage
   */
  restoreSchemaFromStorage(): void {
    try {
      const storedSchema = localStorage.getItem('currentSchema')
      if (storedSchema) {
        const schema = JSON.parse(storedSchema)
        console.log('SchemaStateService: Restoring schema from storage:', schema)
        this.schemaSubject.next(schema)
      }
    } catch (error) {
      console.error('SchemaStateService: Error restoring schema from storage:', error)
      localStorage.removeItem('currentSchema')
    }
  }

  /**
   * Check if schema belongs to the given tenant
   */
  isSchemaValidForTenant(tenantId: string): boolean {
    const currentSchema = this.currentSchema
    return currentSchema ? currentSchema.tenantId === tenantId : true
  }

  /**
   * Clear schema if it doesn't belong to the current tenant
   */
  validateSchemaForTenant(tenantId: string): void {
    if (!this.isSchemaValidForTenant(tenantId)) {
      console.log('SchemaStateService: Schema is not valid for tenant, clearing:', tenantId)
      this.clearSchema()
    }
  }
}
