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
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterLink } from '@angular/router'
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs'

import { IGenericDataType } from '@shared/model'

@Component({
  selector: 'app-generic-data-type-list',
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
    MatCheckboxModule,
    MatTooltipModule,
    RouterLink
  ],
  template: `
    <div class="list-container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav">
        <div class="breadcrumb">
          <a class="breadcrumb-item" routerLink="/definitions/generic">
            <mat-icon>library_books</mat-icon>
            Definitions
          </a>
          <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
          <span class="breadcrumb-item current">Generic Data Types</span>
        </div>
      </nav>

      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>category</mat-icon>
            Generic Data Types
          </mat-card-title>
          <mat-card-subtitle>
            Manage generic data type definitions
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Search and Filter Section -->
          <div class="search-section" [formGroup]="searchForm">
            <div class="search-row">
              <div class="search-input-group">
                <label for="searchValue" class="form-label">Search</label>
                <div class="input-container">
                  <span class="material-icons input-icon">search</span>
                  <input
                    id="searchValue"
                    type="text"
                    formControlName="searchValue"
                    class="form-input"
                    placeholder="Search generic data types..."
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

              <button mat-raised-button color="primary" (click)="createItem()" class="create-button">
                <mat-icon>add</mat-icon>
                New Generic Data Type
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="table-container">
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
                <tr *ngFor="let item of dataSource" class="data-row" (click)="editItem(item)">
                  <td class="name-cell">
                    <h4 class="item-name">{{ item.name }}</h4>
                  </td>
                  <td class="description-cell">
                    <p class="item-description">{{ item.description || 'No description provided' }}</p>
                  </td>
                  <td>
                    <span class="status-badge" [class.active]="item.isActive" [class.inactive]="!item.isActive">
                      {{ item.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button mat-icon-button (click)="editItem(item, $event)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="toggleStatus(item, $event)" 
                            [matTooltip]="item.isActive ? 'Deactivate' : 'Activate'">
                      <mat-icon>{{ item.isActive ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                    </button>
                    <button mat-icon-button (click)="deleteItem(item, $event)" matTooltip="Delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Loading/No Data states -->
            <div *ngIf="loading" class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
            </div>
            <div *ngIf="!loading && dataSource.length === 0" class="no-data-container">
              <p>No generic data types found</p>
              <button mat-raised-button color="primary" (click)="createItem()">
                Create Your First Generic Data Type
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .list-container {
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

    .search-section {
      margin-bottom: 20px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .search-row {
      display: flex;
      gap: 16px;
      align-items: end;
      flex-wrap: wrap;
    }

    .form-label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
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
      top: 50%;
      transform: translateY(-50%);
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

    .item-name {
      font-weight: 600;
      font-size: 1rem;
      margin: 0;
      color: #2e7d32;
      cursor: pointer;
    }

    .item-name:hover {
      color: #1b5e20;
      text-decoration: underline;
    }

    .item-description {
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
    .no-data-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }
  `]
})
export class GenericDataTypeListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly fb = inject(FormBuilder)

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  dataSource: IGenericDataType[] = []
  loading = false

  searchForm: FormGroup

  constructor() {
    this.searchForm = this.fb.group({
      searchValue: [''],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    this.setupSearchSubscription()
    this.loadItems()
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
        this.loadItems()
      })
  }

  private loadItems(): void {
    this.loading = true
    // TODO: Implement actual service call
    setTimeout(() => {
      this.dataSource = []
      this.loading = false
    }, 500)
  }

  clearSearch(): void {
    this.searchForm.reset({
      searchValue: '',
      isActive: true
    })
  }

  createItem(): void {
    console.log('Create new Generic Data Type')
  }

  editItem(item: IGenericDataType, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    console.log('Edit Generic Data Type:', item)
  }

  toggleStatus(item: IGenericDataType, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    console.log('Toggle status for:', item)
  }

  deleteItem(item: IGenericDataType, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    console.log('Delete Generic Data Type:', item)
  }
}
