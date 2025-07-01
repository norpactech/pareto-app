/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { MatTabsModule } from '@angular/material/tabs'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'

import { IContext, IContextDataType, IContextPropertyType } from '@shared/model'
import { ContextService } from '@shared/service/context.service'
import { ContextDataTypeService } from '@shared/service/context-data-type.service'
import { ContextPropertyTypeService } from '@shared/service/context-property-type.service'

@Component({
  selector: 'app-context-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTooltipModule,
    RouterLink
  ],
  template: `
    <div class="detail-container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav">
        <div class="breadcrumb">
          <a class="breadcrumb-item" routerLink="/definitions/context">
            <mat-icon>library_books</mat-icon>
            Definitions
          </a>
          <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
          <a class="breadcrumb-item" routerLink="/definitions/context">
            Contexts
          </a>
          <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
          <span class="breadcrumb-item current">{{ context?.name || 'Context Details' }}</span>
        </div>
      </nav>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div *ngIf="!loading" class="content-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>layers</mat-icon>
              {{ context?.name || 'Context Details' }}
            </mat-card-title>
            <mat-card-subtitle>
              Manage context and related entities
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="contextForm">
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter context name">
                  <mat-error *ngIf="contextForm.get('name')?.hasError('required')">
                    Name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" placeholder="Enter description" rows="3"></textarea>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-checkbox formControlName="isActive">Active</mat-checkbox>
              </div>
            </form>

            <div class="action-buttons">
              <button mat-raised-button color="primary" (click)="saveContext()" [disabled]="contextForm.invalid || saving">
                <mat-icon>save</mat-icon>
                Save Context
              </button>
              <button mat-stroked-button (click)="cancel()">
                <mat-icon>cancel</mat-icon>
                Cancel
              </button>
            </div>

            <!-- Tabs for Related Entities -->
            <mat-tab-group class="entity-tabs" *ngIf="contextId">
              <mat-tab label="Data Types">
                <div class="tab-content">
                  <div class="tab-header">
                    <h3>Context Data Types</h3>
                    <button mat-raised-button color="primary" [routerLink]="['/definitions/context', contextId, 'data-types']">
                      <mat-icon>view_list</mat-icon>
                      View All
                    </button>
                    <button mat-raised-button color="accent" [routerLink]="['/definitions/context', contextId, 'data-types', 'new']">
                      <mat-icon>add</mat-icon>
                      New Data Type
                    </button>
                  </div>

                  <div *ngIf="loadingDataTypes" class="loading-container">
                    <mat-spinner diameter="30"></mat-spinner>
                  </div>

                  <table class="simple-table" *ngIf="!loadingDataTypes && dataTypes.length > 0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let dataType of dataTypes">
                        <td>{{ dataType.name }}</td>
                        <td>{{ dataType.description || 'No description' }}</td>
                        <td>
                          <span class="status-badge" [class.active]="dataType.isActive" [class.inactive]="!dataType.isActive">
                            {{ dataType.isActive ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td>
                          <button mat-icon-button (click)="editDataType(dataType)" matTooltip="Edit">
                            <mat-icon>edit</mat-icon>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div *ngIf="!loadingDataTypes && dataTypes.length === 0" class="empty-state">
                    <p>No data types found for this context</p>
                    <button mat-raised-button color="primary" [routerLink]="['/definitions/context', contextId, 'data-types', 'new']">
                      Add Data Type
                    </button>
                  </div>
                </div>
              </mat-tab>

              <mat-tab label="Property Types">
                <div class="tab-content">
                  <div class="tab-header">
                    <h3>Context Property Types</h3>
                    <button mat-raised-button color="primary" [routerLink]="['/definitions/context', contextId, 'property-types']">
                      <mat-icon>view_list</mat-icon>
                      View All
                    </button>
                    <button mat-raised-button color="accent" [routerLink]="['/definitions/context', contextId, 'property-types', 'new']">
                      <mat-icon>add</mat-icon>
                      New Property Type
                    </button>
                  </div>

                  <div *ngIf="loadingPropertyTypes" class="loading-container">
                    <mat-spinner diameter="30"></mat-spinner>
                  </div>

                  <table class="simple-table" *ngIf="!loadingPropertyTypes && propertyTypes.length > 0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let propertyType of propertyTypes">
                        <td>{{ propertyType['name'] }}</td>
                        <td>{{ propertyType['description'] || 'No description' }}</td>
                        <td>
                          <span class="status-badge" [class.active]="propertyType['isActive']" [class.inactive]="!propertyType['isActive']">
                            {{ propertyType['isActive'] ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td>
                          <button mat-icon-button (click)="editPropertyType(propertyType)" matTooltip="Edit">
                            <mat-icon>edit</mat-icon>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div *ngIf="!loadingPropertyTypes && propertyTypes.length === 0" class="empty-state">
                    <p>No property types found for this context</p>
                    <button mat-raised-button color="primary" [routerLink]="['/definitions/context', contextId, 'property-types', 'new']">
                      Add Property Type
                    </button>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .breadcrumb-nav {
      margin-bottom: 20px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      font-size: 14px;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #2e7d32;
      text-decoration: none;
      cursor: pointer;
    }

    .breadcrumb-item:hover:not(.current) {
      text-decoration: underline;
    }

    .breadcrumb-item.current {
      color: #666;
      cursor: default;
    }

    .breadcrumb-separator {
      margin: 0 8px;
      color: #999;
      font-size: 16px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .form-field {
      width: 100%;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      margin-bottom: 32px;
    }

    .entity-tabs {
      margin-top: 32px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .tab-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .tab-header h3 {
      margin: 0;
      flex-grow: 1;
    }

    .simple-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .simple-table th,
    .simple-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .simple-table th {
      background-color: #f5f5f5;
      font-weight: 600;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.active {
      background-color: #c8e6c9;
      color: #2e7d32;
    }

    .status-badge.inactive {
      background-color: #ffcdd2;
      color: #c62828;
    }

    .empty-state {
      text-align: center;
      padding: 40px 0;
    }

    .empty-state p {
      margin-bottom: 16px;
      color: #757575;
    }
  `]
})
export class ContextDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly fb = inject(FormBuilder)
  private readonly contextService = inject(ContextService)
  private readonly contextDataTypeService = inject(ContextDataTypeService)
  private readonly contextPropertyTypeService = inject(ContextPropertyTypeService)

  contextId: string | null = null
  context: IContext | null = null
  contextForm: FormGroup
  loading = false
  saving = false

  dataTypes: IContextDataType[] = []
  loadingDataTypes = false

  propertyTypes: IContextPropertyType[] = []
  loadingPropertyTypes = false

  constructor() {
    this.contextForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    console.log('ContextDetailComponent ngOnInit called')
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.contextId = params.get('id')
      console.log('Context ID from route:', this.contextId)
      if (this.contextId) {
        this.loadContext()
        this.loadDataTypes()
        this.loadPropertyTypes()
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadContext(): void {
    if (!this.contextId) return

    this.loading = true
    this.contextService.get(this.contextId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (context: IContext | null) => {
        if (context) {
          this.context = context
          this.contextForm.patchValue({
            name: context.name,
            description: context.description,
            isActive: context.isActive
          })
        }
        this.loading = false
      },
      error: (error) => {
        console.error('Error loading context:', error)
        this.loading = false
      }
    })
  }

  loadDataTypes(): void {
    if (!this.contextId) return

    this.loadingDataTypes = true
    this.contextDataTypeService.find({ contextId: this.contextId }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: { data: IContextDataType[]; total: number }) => {
        this.dataTypes = result.data || []
        this.loadingDataTypes = false
      },
      error: (error) => {
        console.error('Error loading context data types:', error)
        this.loadingDataTypes = false
      }
    })
  }

  loadPropertyTypes(): void {
    if (!this.contextId) return

    this.loadingPropertyTypes = true
    this.contextPropertyTypeService.find({ contextId: this.contextId }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: { data: IContextPropertyType[]; total: number }) => {
        this.propertyTypes = result.data || []
        this.loadingPropertyTypes = false
      },
      error: (error) => {
        console.error('Error loading context property types:', error)
        this.loadingPropertyTypes = false
      }
    })
  }

  saveContext(): void {
    if (this.contextForm.invalid) return

    this.saving = true
    const updatedContext: IContext = {
      ...this.context,
      ...this.contextForm.value
    }

    this.contextService.update(updatedContext).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.saving = false
        this.router.navigate(['/definitions/context'])
      },
      error: (error) => {
        console.error('Error saving context:', error)
        this.saving = false
      }
    })
  }

  cancel(): void {
    this.router.navigate(['/definitions/context'])
  }

  editDataType(dataType: IContextDataType): void {
    this.router.navigate(['/definitions/context', this.contextId, 'data-types', dataType.id])
  }

  editPropertyType(propertyType: IContextPropertyType): void {
    this.router.navigate(['/definitions/context', this.contextId, 'property-types', propertyType.id])
  }
}
