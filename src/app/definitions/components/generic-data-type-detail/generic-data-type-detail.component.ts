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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ActivatedRoute, Router } from '@angular/router'
import { debounceTime, Subject, takeUntil } from 'rxjs'
import { MatTabsModule } from '@angular/material/tabs'
import { MatPaginatorModule, type PageEvent } from '@angular/material/paginator'
import { FormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { RouterLink } from '@angular/router'
import { GenericPropertyTypeFormComponent } from '../generic-property-type-form/generic-property-type-form.component'
import { GenericDataTypeAttributeFormComponent } from '../generic-data-type-attribute-form/generic-data-type-attribute-form.component'

import { IGenericDataType, IGenericPropertyType, IGenericDataTypeAttribute } from '@shared/model'
import { GenericDataTypeService } from '@shared/service/generic-data-type.service'
import { GenericPropertyTypeService } from '@shared/service/generic-property-type.service'
import { GenericDataTypeAttributeService } from '@shared/service/generic-data-type-attribute.service'

@Component({
  selector: 'app-generic-data-type-detail',
  standalone: true,
  templateUrl: './generic-data-type-detail.component.html',
  styleUrls: ['./generic-data-type-detail.component.scss'],
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
    MatPaginatorModule,
    RouterLink
  ]
})
export class GenericDataTypeDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly fb = inject(FormBuilder)
  private readonly genericDataTypeService = inject(GenericDataTypeService)
  private readonly genericPropertyTypeService = inject(GenericPropertyTypeService)
  private readonly genericDataTypeAttributeService = inject(GenericDataTypeAttributeService)
  private readonly dialog = inject(MatDialog)

  idGenericDataType: string | null = null
  genericDataType: IGenericDataType | null = null
  genericDataTypeForm: FormGroup
  loading = false
  saving = false
  isNew = false

  // Property type properties
  propertyTypes: IGenericPropertyType[] = []
  loadingPropertyTypes = false
  showActivePropertyTypesOnly = true
  propertyTypeSearch = ''
  private propertyTypeSearchInput$ = new Subject<string>()
  propertyTypePageIndex = 0
  propertyTypePageSize = 10
  propertyTypeTotal = 0

  // Attribute properties
  attributes: IGenericDataTypeAttribute[] = []
  loadingAttributes = false
  showActiveAttributesOnly = true
  attributePageIndex = 0
  attributePageSize = 10
  attributeTotal = 0

  constructor() {
    this.genericDataTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      alias: [''],
      sequence: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.idGenericDataType = params.get('id')
      this.isNew = this.idGenericDataType === 'new'
      
      if (!this.isNew && this.idGenericDataType) {
        this.loadGenericDataType()
        this.loadPropertyTypes()
        this.loadAttributes()
      }
    })

    this.propertyTypeSearchInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((searchValue) => {
        this.propertyTypeSearch = searchValue
        this.propertyTypePageIndex = 0
        this.loadPropertyTypes()
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadGenericDataType(): void {
    if (!this.idGenericDataType) return

    this.loading = true
    this.genericDataTypeService.get(this.idGenericDataType).pipe(takeUntil(this.destroy$)).subscribe({
      next: (genericDataType: IGenericDataType | null) => {
        if (genericDataType) {
          this.genericDataType = genericDataType
          this.genericDataTypeForm.patchValue({
            name: genericDataType.name,
            description: genericDataType.description,
            alias: genericDataType.alias,
            sequence: genericDataType.sequence,
            isActive: genericDataType.isActive
          })
        }
        this.loading = false
      },
      error: (error) => {
        console.error('Error loading generic data type:', error)
        this.loading = false
      }
    })
  }

  cancel(): void {
    this.router.navigate(['/definitions/generic'])
  }

  saveGenericDataType(): void {
    if (this.genericDataTypeForm.invalid) return

    this.saving = true
    const formData = this.genericDataTypeForm.value

    const genericDataTypeData: IGenericDataType = this.isNew 
      ? { ...formData, idTenant: 'system', tenantName: 'System' }
      : { ...this.genericDataType, ...formData }

    const saveOperation = this.isNew
      ? this.genericDataTypeService.create(genericDataTypeData)
      : this.genericDataTypeService.update(genericDataTypeData)

    saveOperation.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.saving = false
        this.router.navigate(['/definitions/generic'])
      },
      error: (error) => {
        console.error('Error saving generic data type:', error)
        this.saving = false
      }
    })
  }

  loadPropertyTypes(): void {
    if (!this.idGenericDataType || this.isNew) return

    this.loadingPropertyTypes = true
    const params: Record<string, string | boolean | number> = {
      idGenericDataType: this.idGenericDataType,
      searchValue: this.propertyTypeSearch,
      page: this.propertyTypePageIndex,
      limit: this.propertyTypePageSize,
      sortColumn: 'name',
      sortDirection: 'asc'
    }
    if (this.showActivePropertyTypesOnly) {
      params['isActive'] = true
    }
    if (this.propertyTypeSearch) {
      params['searchColumn'] = 'name'
    }
    this.genericPropertyTypeService.find(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: { data: IGenericPropertyType[]; total: number }) => {
        this.propertyTypes = result.data || []
        this.propertyTypeTotal = result.total || 0
        this.loadingPropertyTypes = false
      },
      error: (error) => {
        console.error('Error loading property types:', error)
        this.loadingPropertyTypes = false
      }
    })
  }

  loadAttributes(): void {
    if (!this.idGenericDataType || this.isNew) return

    this.loadingAttributes = true
    const params: Record<string, string | boolean | number> = {
      idGenericDataType: this.idGenericDataType,
      page: this.attributePageIndex,
      limit: this.attributePageSize
    }
    if (this.showActiveAttributesOnly) {
      params['isActive'] = true
    }
    this.genericDataTypeAttributeService.find(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: { data: IGenericDataTypeAttribute[]; total: number }) => {
        this.attributes = result.data || []
        this.attributeTotal = result.total || 0
        this.loadingAttributes = false
      },
      error: (error) => {
        console.error('Error loading attributes:', error)
        this.loadingAttributes = false
      }
    })
  }

  // Property type methods
  openPropertyTypeDialog(propertyType?: IGenericPropertyType): void {
    this.dialog.open(GenericPropertyTypeFormComponent, {
      width: '600px',
      data: {
        idGenericDataType: this.idGenericDataType,
        idPropertyType: propertyType?.id ?? null
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loadPropertyTypes()
      }
    })
  }

  editPropertyType(propertyType: IGenericPropertyType): void {
    this.openPropertyTypeDialog(propertyType)
  }

  togglePropertyTypeActive(propertyType: IGenericPropertyType): void {
    const updated: IGenericPropertyType = { ...propertyType, isActive: !propertyType.isActive }
    this.genericPropertyTypeService.update(updated).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadPropertyTypes(),
      error: (error) => console.error('Error toggling property type active:', error)
    })
  }

  deletePropertyType(propertyType: IGenericPropertyType): void {
    if (!confirm(`Are you sure you want to delete property type "${propertyType.name}"?`)) return
    this.genericPropertyTypeService.delete({ id: propertyType.id, updatedAt: propertyType.updatedAt, updatedBy: 'system' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadPropertyTypes(),
        error: (error) => console.error('Error deleting property type:', error)
      })
  }

  onPropertyTypeSearchChange(): void {
    this.propertyTypePageIndex = 0
    this.loadPropertyTypes()
  }

  clearPropertyTypeSearch(): void {
    this.propertyTypeSearch = ''
    this.showActivePropertyTypesOnly = true
    this.propertyTypePageIndex = 0
    this.loadPropertyTypes()
  }

  clearPropertyTypeFilters(): void {
    this.propertyTypeSearch = ''
    this.showActivePropertyTypesOnly = true
    this.propertyTypePageIndex = 0
    this.loadPropertyTypes()
  }

  onPropertyTypePage(event: PageEvent): void {
    this.propertyTypePageIndex = event.pageIndex
    this.propertyTypePageSize = event.pageSize
    this.loadPropertyTypes()
  }

  // Attribute methods
  openAttributeDialog(attribute?: IGenericDataTypeAttribute): void {
    this.dialog.open(GenericDataTypeAttributeFormComponent, {
      width: '500px',
      data: {
        idGenericDataType: this.idGenericDataType,
        idAttribute: attribute?.id ?? null
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loadAttributes()
      }
    })
  }

  editAttribute(attribute: IGenericDataTypeAttribute): void {
    this.openAttributeDialog(attribute)
  }

  toggleAttributeActive(attribute: IGenericDataTypeAttribute): void {
    const updated: IGenericDataTypeAttribute = { ...attribute, isActive: !attribute.isActive }
    this.genericDataTypeAttributeService.update(updated).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadAttributes(),
      error: (error) => console.error('Error toggling attribute active:', error)
    })
  }

  deleteAttribute(attribute: IGenericDataTypeAttribute): void {
    if (!confirm(`Are you sure you want to delete attribute "${attribute.name}"?`)) return
    this.genericDataTypeAttributeService.delete({ id: attribute.id, updatedAt: attribute.updatedAt, updatedBy: 'system' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadAttributes(),
        error: (error) => console.error('Error deleting attribute:', error)
      })
  }

  clearAttributeFilters(): void {
    this.showActiveAttributesOnly = true
    this.attributePageIndex = 0
    this.loadAttributes()
  }

  onAttributePage(event: PageEvent): void {
    this.attributePageIndex = event.pageIndex
    this.attributePageSize = event.pageSize
    this.loadAttributes()
  }

  onAnchorKeydown(event: KeyboardEvent, propertyType: IGenericPropertyType): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      this.editPropertyType(propertyType)
    }
  }

  onAttributeAnchorKeydown(event: KeyboardEvent, attribute: IGenericDataTypeAttribute): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      this.editAttribute(attribute)
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.genericDataTypeForm.get(fieldName)
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`
    }
    if (control?.hasError('min')) {
      return `${this.getFieldDisplayName(fieldName)} must be 0 or greater`
    }
    return ''
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      name: 'Name',
      sequence: 'Sequence'
    }
    return displayNames[fieldName] || fieldName
  }
}
