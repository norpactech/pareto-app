/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator'
import { MatSortModule, MatSort } from '@angular/material/sort'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatCardModule } from '@angular/material/card'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatChipsModule } from '@angular/material/chips'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatMenuModule } from '@angular/material/menu'
import { MatDividerModule } from '@angular/material/divider'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs'

import { SchemaStateService } from '@shared/state/schema-state.service'
import { DataObjectStateService } from '@shared/state/data-object-state.service'
import { DataObjectService } from '@shared/service/data-object.service'
import { ConfirmationDialogComponent } from '@shared/dialogs'
import { IDataObject } from '@shared/model'
import { DataObjectFormComponent, DataObjectFormData } from '../data-object-form/data-object-form.component'

@Component({
  selector: 'app-data-object-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule
  ],
  template: `
    <div class="data-object-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>table_chart</mat-icon>
            Data Objects
          </mat-card-title>
          <mat-card-subtitle *ngIf="currentSchema">
            Schema: {{ currentSchema.name }}
          </mat-card-subtitle>
          <mat-card-subtitle *ngIf="!currentSchema">
            Select a schema to manage data objects
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Search and Filter Section -->
          <div class="search-section" [formGroup]="searchForm" *ngIf="currentSchema">
            <div class="search-row">
              <div class="search-column-group">
                <label for="searchColumn" class="form-label">Search In</label>
                <div class="select-container">
                  <select
                    id="searchColumn"
                    formControlName="searchColumn"
                    class="form-select"
                  >
                    <option *ngFor="let column of searchColumns" [value]="column.value">
                      {{ column.label }}
                    </option>
                  </select>
                  <span class="material-icons select-icon">expand_more</span>
                </div>
              </div>

              <div class="search-input-group">
                <label for="searchValue" class="form-label">Search Value</label>
                <div class="input-container">
                  <span class="material-icons input-icon">search</span>
                  <input
                    id="searchValue"
                    type="text"
                    formControlName="searchValue"
                    class="form-input"
                    placeholder="Enter search term..."
                  />
                </div>
              </div>

              <mat-checkbox formControlName="isActive" class="active-filter">
                Show Active Only
              </mat-checkbox>

              <button mat-raised-button type="button" (click)="clearSearch()" class="clear-button">
                <mat-icon>clear</mat-icon>
                Clear
              </button>

              <button mat-raised-button color="primary" 
                      (click)="createDataObject()" 
                      [disabled]="!currentSchema"
                      class="create-button">
                <mat-icon>add</mat-icon>
                New Data Object
              </button>
            </div>
          </div>

          <!-- No Schema Selected -->
          <div class="no-schema-container" *ngIf="!currentSchema">
            <mat-icon class="no-data-icon">schema</mat-icon>
            <p>Please select a tenant and schema to manage data objects.</p>
          </div>

          <!-- Simple HTML Table -->
          <div class="table-container" *ngIf="currentSchema">
            <table class="simple-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let dataObject of dataSource" class="data-row" (click)="editDataObject(dataObject)">
                  <td class="name-cell">
                    <h4 class="data-object-name">{{ dataObject.name }}</h4>
                  </td>
                  <td class="description-cell">
                    <p class="data-object-description">{{ dataObject.description || 'No description provided' }}</p>
                  </td>
                  <td>
                    <span class="status-badge" [class.active]="dataObject.isActive" [class.inactive]="!dataObject.isActive">
                      {{ dataObject.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button mat-icon-button (click)="editDataObject(dataObject, $event)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="toggleDataObjectStatus(dataObject, $event)" 
                            [matTooltip]="dataObject.isActive ? 'Deactivate' : 'Activate'">
                      <mat-icon>{{ dataObject.isActive ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                    </button>
                    <button mat-icon-button (click)="deleteDataObject(dataObject, $event)" matTooltip="Delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Paginator at bottom -->
            <mat-paginator 
              *ngIf="totalItems > 10"
              [length]="totalItems"
              [pageSize]="10"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (page)="onPageChange()">
            </mat-paginator>

            <!-- Loading/No Data states -->
            <div *ngIf="loading" class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
            </div>
            <div *ngIf="!loading && dataSource.length === 0" class="no-data-container">
              <p>No data objects found</p>
              <button mat-raised-button color="primary" (click)="createDataObject()">
                Create Your First Data Object
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .data-object-list-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .search-section {
      margin-bottom: 20px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .search-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-column-group {
      min-width: 150px;
    }

    .form-label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .select-container {
      position: relative;
    }

    .select-icon {
      position: absolute;
      right: 12px;
      z-index: 2;
      font-size: 20px;
      pointer-events: none;
    }

    .form-select {
      width: 100%;
      padding: 12px 44px 12px 16px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      appearance: none;
      cursor: pointer;
    }

    .search-input-group {
      flex: 1;
      min-width: 200px;
    }

    .input-container {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      z-index: 2;
      font-size: 20px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px 12px 44px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
    }

    .active-filter {
      margin-left: 8px;
    }

    .clear-button,
    .create-button {
      height: 40px;
      margin-left: auto;
    }

    .create-button {
      margin-left: 8px;
    }

    .table-container {
      position: relative;
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

    .data-object-name {
      font-weight: 600;
      font-size: 1rem;
      margin: 0;
      color: #2e7d32; // Green link color
      cursor: pointer;
    }

    .data-object-name:hover {
      color: #1b5e20; // Darker green on hover
      text-decoration: underline;
    }

    .data-object-description {
      font-size: 0.9rem;
      margin: 0;
    }

    .data-row {
      cursor: pointer;
    }

    .data-row:hover {
      background-color: #f9f9f9;
    }

    .actions-cell {
      white-space: nowrap;
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

    .loading-container,
    .no-schema-container,
    .no-data-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .no-data-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .data-objects-paginator {
      margin-bottom: 16px;
    }

    .top-paginator {
      margin-bottom: 16px;
      margin-top: 0;
    }

    .table-info {
      padding: 8px 16px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
      border-top: 1px solid #ddd;
      background: #f9f9f9;
    }

    // Simple paginator at bottom - no position fixed
    mat-paginator {
      margin-top: 20px;
      background: var(--surface-50); // Use global background color instead of white
      border: 1px solid #ddd;
      border-radius: 4px;
      
      // Move "Items per page" text to the right of the control
      ::ng-deep .mat-mdc-paginator-page-size {
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        
        .mat-mdc-paginator-page-size-label {
          margin: 0 8px 0 0;
          order: 2;
        }
        
        .mat-mdc-paginator-page-size-select {
          order: 1;
          margin: 0 0 0 8px;
        }
      }
    }
  `]
})
export class DataObjectListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly schemaStateService = inject(SchemaStateService)
  private readonly dataObjectStateService = inject(DataObjectStateService)
  private readonly dataObjectService = inject(DataObjectService)
  private readonly dialog = inject(MatDialog)
  private readonly fb = inject(FormBuilder)

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  currentSchema: { id: string; name: string } | null = null
  dataSource: IDataObject[] = []
  totalItems = 0
  loading = false
  
  // Add component-level pagination tracking
  currentPageIndex = 0
  currentPageSize = 10

  searchForm: FormGroup
  
  displayedColumns: string[] = ['name', 'description', 'isActive', 'actions']
  
  searchColumns = [
    { value: 'name', label: 'Name' },
    { value: 'description', label: 'Description' }
  ]

  constructor() {
    this.searchForm = this.fb.group({
      searchColumn: ['name'],
      searchValue: [''],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    console.log('DataObjectList: Component initialized')
    this.subscribeToSchemaChanges()
    this.setupSearchSubscription()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private setupSearchSubscription(): void {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadDataObjects()
      })
  }

  private subscribeToSchemaChanges(): void {
    this.schemaStateService.schema$
      .pipe(takeUntil(this.destroy$))
      .subscribe(schema => {
        console.log('DataObjectList: Schema changed:', schema)
        this.currentSchema = schema
        
        if (schema) {
          this.loadDataObjects()
        } else {
          this.dataSource = []
          this.dataObjectStateService.clearDataObjects()
        }
      })
  }

  private loadDataObjects(): void {
    if (!this.currentSchema) {
      return
    }

    console.log('DataObjectList: Loading data objects for schema:', this.currentSchema.id)
    this.loading = true

    const params = {
      idSchema: this.currentSchema.id,
      page: this.currentPageIndex,
      limit: this.currentPageSize,
      sortColumn: this.sort?.active || 'name',
      sortDirection: this.sort?.direction || 'asc',
      ...this.searchForm.value
    }

    this.dataObjectService.find(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('DataObjectList: Data objects response:', response)
          this.dataSource = response.data || []
          this.totalItems = response.total
          // Update the state service with the loaded data
          this.dataObjectStateService.setDataObjects(this.dataSource)
          this.loading = false
        },
        error: (error) => {
          console.error('DataObjectList: Error loading data objects:', error)
          this.loading = false
        }
      })
  }

  onPageChange(): void {
    // Update our tracking variables
    this.currentPageIndex = this.paginator?.pageIndex || 0
    this.currentPageSize = this.paginator?.pageSize || 10
    this.loadDataObjects()
  }

  onSortChange(): void {
    this.loadDataObjects()
  }

  clearSearch(): void {
    this.searchForm.reset({
      searchColumn: 'name',
      searchValue: '',
      isActive: true
    })
  }

  createDataObject(): void {
    const dialogRef = this.dialog.open(DataObjectFormComponent, {
      width: '600px',
      data: { mode: 'create' } as DataObjectFormData
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success && result?.dataObject) {
        console.log('Data object created successfully:', result.dataObject)
        // Add to state service to trigger updates in other components
        this.dataObjectStateService.addDataObject(result.dataObject)
        // Also reload the local list to ensure consistency
        if (this.currentSchema) {
          this.loadDataObjects()
        }
      }
    })
  }

  editDataObject(dataObject: IDataObject, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    
    const dialogRef = this.dialog.open(DataObjectFormComponent, {
      width: '600px',
      data: { 
        mode: 'edit', 
        dataObject: dataObject 
      } as DataObjectFormData
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        console.log('Data object updated successfully')
        // Update state service to trigger updates in other components
        if (result?.dataObject) {
          this.dataObjectStateService.updateDataObject(result.dataObject)
        }
        // Reload the data objects list
        if (this.currentSchema) {
          this.loadDataObjects()
        }
      }
    })
  }

  toggleDataObjectStatus(dataObject: IDataObject, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    
    const action = dataObject.isActive ? 'deactivate' : 'activate'
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Data Object`,
        message: `Are you sure you want to ${action} "${dataObject.name}"?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelText: 'Cancel'
      }
    })

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.dataObjectService.deactReact({
          id: dataObject.id,
          updatedAt: dataObject.updatedAt,
          isActive: !dataObject.isActive
        }).subscribe({
          next: () => {
            console.log(`Data object ${action}d successfully`)
            // Update state service to trigger updates in other components
            this.dataObjectStateService.updateDataObjectStatus(dataObject.id, !dataObject.isActive)
            // Reload the data objects list
            if (this.currentSchema) {
              this.loadDataObjects()
            }
          },
          error: (error) => {
            console.error(`Error ${action}ing data object:`, error)
          }
        })
      }
    })
  }

  deleteDataObject(dataObject: IDataObject, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Data Object',
        message: `Are you sure you want to delete "${dataObject.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    })

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.dataObjectService.delete({
          id: dataObject.id,
          updatedAt: dataObject.updatedAt,
          updatedBy: 'current-user' // TODO: Get from auth service
        }).subscribe({
          next: () => {
            console.log('Data object deleted successfully')
            // Update state service to trigger updates in other components
            this.dataObjectStateService.removeDataObject(dataObject.id)
            // Reload the data objects list
            if (this.currentSchema) {
              this.loadDataObjects()
            }
          },
          error: (error) => {
            console.error('Error deleting data object:', error)
          }
        })
      }
    })
  }

  getStartIndex(): number {
    return (this.currentPageIndex * this.currentPageSize) + 1
  }

  getEndIndex(): number {
    const startIndex = this.currentPageIndex * this.currentPageSize
    return Math.min(startIndex + this.currentPageSize, this.totalItems)
  }
}