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
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs'

import { IGenericDataType } from '@shared/model'
import { GenericDataTypeService } from '@shared/service/generic-data-type.service'

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
  templateUrl: './generic-data-type-list.component.html',
  styleUrls: ['./generic-data-type-list.component.scss']
})
export class GenericDataTypeListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly genericDataTypeService = inject(GenericDataTypeService)

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  dataSource: IGenericDataType[] = []
  loading = false
  totalItems = 0
  
  // Pagination parameters
  currentPageIndex = 0
  currentPageSize = 10
  pageSizeOptions = [5, 10, 25, 50]

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
    
    const params = {
      searchColumn: 'name',
      searchValue: this.searchForm.get('searchValue')?.value || '',
      isActive: this.searchForm.get('isActive')?.value,
      page: this.currentPageIndex,
      limit: this.currentPageSize,
      sortColumn: 'sequence',
      sortDirection: 'asc'
    }
    
    this.genericDataTypeService.find(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: { data: IGenericDataType[]; total: number }) => {
          console.log('Generic data types loaded:', result)
          this.dataSource = result.data || []
          this.totalItems = result.total || 0
          this.loading = false
        },
        error: (error) => {
          console.error('Error loading generic data types:', error)
          this.loading = false
          this.dataSource = []
          this.totalItems = 0
        }
      })
  }
  
  onPageChange(): void {
    this.currentPageIndex = this.paginator?.pageIndex || 0
    this.currentPageSize = this.paginator?.pageSize || 10
    this.loadItems()
  }

  clearSearch(): void {
    this.searchForm.reset({
      searchValue: '',
      isActive: true
    })
  }

  editItem(item: IGenericDataType, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    console.log('Editing generic data type:', item)
    console.log('Current route:', this.router.url) // Check current route
    
    // Try absolute navigation
    this.router.navigateByUrl(`/definitions/generic/${item.id}`).then(
      (success) => console.log('Navigation success:', success),
      (error) => console.error('Navigation failed:', error)
    ).catch(err => console.error('Navigation error:', err))
  }

  createItem(): void {
    console.log('Creating new generic data type') // Debug log
    console.log('Navigating to:', ['/definitions/generic', 'new']) // Debug navigation
    
    // Try direct navigation with error handling
    this.router.navigate(['/definitions/generic', 'new']).then(
      (success) => console.log('Create navigation success:', success),
      (error) => console.error('Create navigation failed:', error)
    ).catch(err => console.error('Create navigation error:', err))
  }

  toggleStatus(item: IGenericDataType, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    console.log('Toggling status for:', item) // Debug log
    const updated: IGenericDataType = { ...item, isActive: !item.isActive }
    this.genericDataTypeService.update(updated).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log('Status updated successfully')
        this.loadItems()
      },
      error: (error) => {
        console.error('Error toggling status:', error)
      }
    })
  }

  deleteItem(item: IGenericDataType, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    console.log('Deleting generic data type:', item) // Debug log
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return
    
    this.genericDataTypeService.delete({ id: item.id, updatedAt: item.updatedAt, updatedBy: 'system' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Item deleted successfully')
          this.loadItems()
        },
        error: (error) => {
          console.error('Error deleting item:', error)
        }
      })
  }
}
