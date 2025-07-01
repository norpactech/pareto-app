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
import { Subject, takeUntil } from 'rxjs'

import { SchemaService } from '@shared/service/schema.service'
import { SchemaStateService, SchemaContext } from '@shared/state/schema-state.service'
import { TenantStateService, TenantContext } from '@shared/state/tenant-state.service'
import { ISchema } from '@shared/model'

@Component({
  selector: 'app-schema-switcher',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <!-- Show for multiple schemas -->
    <div class="schema-switcher" *ngIf="tenantSchemas.length > 1">
      <mat-icon class="schema-icon" matTooltip="Switch Schema Context">storage</mat-icon>
      
      <mat-select
        [value]="currentSchema?.id"
        (selectionChange)="onSchemaChange($event.value)"
        [disabled]="loading || !currentTenant"
        class="schema-select"
        placeholder="Select Schema">
        
        <mat-option *ngFor="let schema of tenantSchemas" [value]="schema.id">
          <div class="schema-option">
            <span class="schema-name">{{ schema.name }}</span>
            <span class="schema-database" *ngIf="showSchemaDetails">{{ schema.database }}</span>
            <span class="schema-id" *ngIf="showSchemaIds">{{ schema.id }}</span>
          </div>
        </mat-option>
      </mat-select>
      
      <mat-spinner 
        *ngIf="loading" 
        diameter="20" 
        class="loading-spinner">
      </mat-spinner>
    </div>
    
    <!-- Show for single schema -->
    <div class="single-schema-display" *ngIf="tenantSchemas.length === 1 && !loading">
      <mat-icon class="schema-icon" matTooltip="Current Schema">storage</mat-icon>
      <span class="schema-name">{{ tenantSchemas[0].name }}</span>
    </div>
    
    <!-- Debug: Show loading state -->
    <div class="schema-loading" *ngIf="loading && tenantSchemas.length === 0">
      <mat-spinner diameter="20" class="loading-spinner"></mat-spinner>
      <span>Loading schemas...</span>
    </div>
    
    <!-- Debug: Show when no schemas found -->
    <div class="no-schemas" *ngIf="!loading && tenantSchemas.length === 0 && currentTenant">
      <mat-icon class="schema-icon">storage_off</mat-icon>
      <span>No schemas found</span>
    </div>
    
    <!-- Show when no tenant selected -->
    <div class="no-tenant" *ngIf="!currentTenant">
      <mat-icon class="schema-icon">business_center</mat-icon>
      <span>Select tenant first</span>
    </div>
  `,
  styles: [`
    .schema-switcher {
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

    .single-schema-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 8px;
      background: var(--surface-100);
      border: 1px solid var(--surface-200);
      min-width: 150px;
    }

    .schema-icon {
      color: var(--accent-500);
      font-size: 20px;
      margin-right: 0.25rem;
    }

    .schema-select {
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

    .schema-option {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      
      .schema-name {
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .schema-database {
        font-size: 0.8rem;
        color: var(--text-secondary);
        font-style: italic;
      }
      
      .schema-id {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-family: monospace;
      }
    }

    .loading-spinner {
      ::ng-deep circle {
        stroke: var(--accent-500);
      }
    }

    .schema-loading,
    .no-schemas,
    .no-tenant {
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

    .no-schemas {
      border-color: var(--warning-300);
      background: var(--warning-50);
      color: var(--warning-700);
    }

    .no-tenant {
      border-color: var(--info-300);
      background: var(--info-50);
      color: var(--info-700);
    }

    // Responsive design
    @media (max-width: 768px) {
      .schema-switcher {
        min-width: 150px;
        padding: 0.25rem;
      }
      
      .schema-icon {
        font-size: 18px;
      }
      
      .schema-select {
        font-size: 0.8rem;
      }
    }
  `]
})
export class SchemaSwitcherComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly schemaService = inject(SchemaService)
  private readonly schemaStateService = inject(SchemaStateService)
  private readonly tenantStateService = inject(TenantStateService)

  tenantSchemas: ISchema[] = []
  currentSchema: SchemaContext | null = null
  currentTenant: TenantContext | null = null
  loading = false
  showSchemaDetails = false // Set to true to show database names
  showSchemaIds = false // Set to true in development if needed

  ngOnInit(): void {
    console.log('SchemaSwitcher: Component initialized')
    this.subscribeToTenantChanges()
    this.subscribeToSchemaChanges()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private subscribeToTenantChanges(): void {
    this.tenantStateService.tenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tenant => {
        console.log('SchemaSwitcher: Tenant changed:', tenant)
        this.currentTenant = tenant
        
        if (tenant) {
          // Validate current schema belongs to this tenant
          this.schemaStateService.validateSchemaForTenant(tenant.id)
          // Load schemas for the new tenant
          this.loadSchemasForTenant(tenant.id)
        } else {
          // No tenant selected, clear schemas
          this.tenantSchemas = []
          this.schemaStateService.clearSchema()
        }
      })
  }

  private subscribeToSchemaChanges(): void {
    this.schemaStateService.schema$
      .pipe(takeUntil(this.destroy$))
      .subscribe(schema => {
        console.log('SchemaSwitcher: Schema changed:', schema)
        this.currentSchema = schema
      })
  }

  private loadSchemasForTenant(tenantId: string): void {
    console.log('SchemaSwitcher: Loading schemas for tenant:', tenantId)
    this.loading = true
    
    // Get schemas for the current tenant
    this.schemaService.find({ idTenant: tenantId, isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('SchemaSwitcher: Schemas response:', response)
          this.tenantSchemas = response.data || []
          console.log('SchemaSwitcher: Tenant schemas:', this.tenantSchemas)
          
          // If no current schema is set and we have schemas, set the first one
          if (!this.currentSchema && this.tenantSchemas.length > 0) {
            console.log('SchemaSwitcher: Setting first schema as current:', this.tenantSchemas[0])
            this.setCurrentSchema(this.tenantSchemas[0])
          }
          
          // If current schema doesn't belong to this tenant, clear it
          if (this.currentSchema && this.currentSchema.tenantId !== tenantId) {
            console.log('SchemaSwitcher: Current schema does not belong to tenant, clearing')
            this.schemaStateService.clearSchema()
          }
          
          this.loading = false
        },
        error: (error) => {
          console.error('SchemaSwitcher: Error loading schemas:', error)
          this.loading = false
        }
      })
  }

  onSchemaChange(schemaId: string): void {
    const selectedSchema = this.tenantSchemas.find(s => s.id === schemaId)
    if (selectedSchema) {
      this.setCurrentSchema(selectedSchema)
    }
  }

  private setCurrentSchema(schema: ISchema): void {
    const schemaContext: SchemaContext = {
      id: schema.id,
      name: schema.name,
      tenantId: schema.idTenant
    }
    
    this.schemaStateService.setSchema(schemaContext)
    
    // Emit event for other components to react to schema change
    console.log('Schema context switched to:', schema.name, 'for tenant:', schema.idTenant)
  }
}
