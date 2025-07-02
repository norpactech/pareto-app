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
import { debounceTime, Subject, takeUntil } from 'rxjs'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginatorModule, type PageEvent } from '@angular/material/paginator'
import { FormsModule } from '@angular/forms'

import { IContext, IContextDataType, IContextPropertyType } from '@shared/model'
import { ContextService } from '@shared/service/context.service'
import { ContextDataTypeService } from '@shared/service/context-data-type.service'
import { ContextPropertyTypeService } from '@shared/service/context-property-type.service'
import { ContextDataTypeFormComponent } from '../context-data-type-form/context-data-type-form.component'
import { ContextPropertyTypeFormComponent } from '../context-property-type-form/context-property-type-form.component'

@Component({
  selector: 'app-context-detail',
  standalone: true,
  templateUrl: './context-detail.component.html',
  styleUrls: ['./context-detail.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTooltipModule,
    RouterLink,
    MatPaginatorModule
  ]
})
export class ContextDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly fb = inject(FormBuilder)
  private readonly contextService = inject(ContextService)
  private readonly contextDataTypeService = inject(ContextDataTypeService)
  private readonly contextPropertyTypeService = inject(ContextPropertyTypeService)
  private readonly dialog = inject(MatDialog)

  idContext: string | null = null
  context: IContext | null = null
  contextForm: FormGroup
  loading = false
  saving = false

  // Data type table search and pagination
  dataTypeSearch = ''
  showActiveDataTypesOnly = true
  private dataTypeSearchInput$ = new Subject<string>()
  dataTypePageIndex = 0
  dataTypePageSize = 10
  dataTypeTotal = 0
  get dataTypeTotalPages(): number {
    return Math.ceil(this.dataTypeTotal / this.dataTypePageSize) || 1
  }

  dataTypes: IContextDataType[] = []
  loadingDataTypes = false

  propertyTypes: IContextPropertyType[] = []
  loadingPropertyTypes = false
  showActivePropertyTypesOnly = true
  propertyTypePageIndex = 0
  propertyTypePageSize = 10
  propertyTypeTotal = 0

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
      this.idContext = params.get('id')
      console.log('Context ID from route:', this.idContext)
      if (this.idContext) {
        this.loadContext()
        this.loadDataTypes()
        this.loadPropertyTypes()
      }
    })

    this.dataTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((searchValue) => {
        this.dataTypeSearch = searchValue
        this.dataTypePageIndex = 0
        this.loadDataTypes()
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadContext(): void {
    if (!this.idContext) return

    this.loading = true
    this.contextService.get(this.idContext).pipe(takeUntil(this.destroy$)).subscribe({
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
    if (!this.idContext) return

    this.loadingDataTypes = true
    const params: Record<string, string | boolean | number> = {
      idContext: this.idContext,
      searchValue: this.dataTypeSearch,
      page: this.dataTypePageIndex,
      limit: this.dataTypePageSize,
      sortColumn: 'sequence',
      sortDirection: 'asc'
    }
    if (this.showActiveDataTypesOnly) {
      params['isActive'] = true
    }
    if (this.dataTypeSearch) {
      params['searchColumn'] = 'name'
    }
    this.contextDataTypeService.find(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: { data: IContextDataType[]; total: number }) => {
        this.dataTypes = result.data || []
        this.dataTypeTotal = result.total || 0
        this.loadingDataTypes = false
      },
      error: (error) => {
        console.error('Error loading context data types:', error)
        this.loadingDataTypes = false
      }
    })
  }

  loadPropertyTypes(): void {
    if (!this.idContext) return

    this.loadingPropertyTypes = true
    const params: Record<string, string | boolean | number> = {
      idContext: this.idContext,
      page: this.propertyTypePageIndex,
      limit: this.propertyTypePageSize
    }
    if (this.showActivePropertyTypesOnly) {
      params['isActive'] = true
    }
    this.contextPropertyTypeService.find(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: { data: IContextPropertyType[]; total: number }) => {
        this.propertyTypes = result.data || []
        this.propertyTypeTotal = result.total || 0
        this.loadingPropertyTypes = false
      },
      error: (error) => {
        console.error('Error loading context property types:', error)
        this.loadingPropertyTypes = false
      }
    })
  }

  openDataTypeDialog(dataType?: IContextDataType): void {
    this.dialog.open(ContextDataTypeFormComponent, {
      width: '500px',
      data: {
        idContext: this.idContext,
        idDataType: dataType?.id ?? null
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loadDataTypes()
      }
    })
  }

  editPropertyType(propertyType: IContextPropertyType): void {
    this.dialog.open(ContextPropertyTypeFormComponent, {
      width: '600px',
      data: {
        idContext: this.idContext,
        idPropertyType: propertyType.id
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loadPropertyTypes()
      }
    })
  }

  togglePropertyTypeActive(propertyType: IContextPropertyType): void {
    const updated: IContextPropertyType = { ...propertyType, isActive: !propertyType.isActive }
    this.contextPropertyTypeService.update(updated).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadPropertyTypes(),
      error: (error) => console.error('Error toggling property type active:', error)
    })
  }

  deletePropertyType(propertyType: IContextPropertyType): void {
    if (!confirm(`Are you sure you want to delete property type "${propertyType.genericPropertyTypeName}"?`)) return
    this.contextPropertyTypeService.delete({ id: propertyType.id, updatedAt: propertyType.updatedAt, updatedBy: 'system' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadPropertyTypes(),
        error: (error) => console.error('Error deleting property type:', error)
      })
  }

  toggleDataTypeActive(dataType: IContextDataType): void {
    const updated: IContextDataType = { ...dataType, isActive: !dataType.isActive }
    this.contextDataTypeService.update(updated).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadDataTypes(),
      error: (error) => console.error('Error toggling data type active:', error)
    })
  }

  deleteDataType(dataType: IContextDataType): void {
    if (!confirm(`Are you sure you want to delete data type "${dataType.name}"?`)) return
    this.contextDataTypeService.delete({ id: dataType.id, updatedAt: dataType.updatedAt, updatedBy: 'system' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadDataTypes(),
        error: (error) => console.error('Error deleting data type:', error)
      })
  }

  cancel(): void {
    this.router.navigate(['/definitions/context'])
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

  onDataTypeSearchInput(value: string): void {
    this.dataTypeSearchInput$.next(value)
  }

  onDataTypeSearchChange(): void {
    // Reset to first page when search changes
    this.dataTypePageIndex = 0
    this.loadDataTypes()
  }

  clearDataTypeSearch(): void {
    this.dataTypeSearch = ''
    this.showActiveDataTypesOnly = true
    this.dataTypePageIndex = 0
    this.loadDataTypes()
  }

  onDataTypePage(event: PageEvent): void {
    this.dataTypePageIndex = event.pageIndex
    this.dataTypePageSize = event.pageSize
    this.loadDataTypes()
  }

  onPropertyTypePage(event: PageEvent): void {
    this.propertyTypePageIndex = event.pageIndex
    this.propertyTypePageSize = event.pageSize
    this.loadPropertyTypes()
  }

  editDataType(dataType: IContextDataType): void {
    this.openDataTypeDialog(dataType)
  }

  getErrorMessage(fieldName: string): string {
    const control = this.contextForm.get(fieldName)
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`
    }
    return ''
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      name: 'Name',
      description: 'Description'
    }
    return displayNames[fieldName] || fieldName
  }

  clearPropertyTypeFilters(): void {
    this.showActivePropertyTypesOnly = true
    this.propertyTypePageIndex = 0
    this.loadPropertyTypes()
  }
}