/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Subject, takeUntil } from 'rxjs'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import { IGenericDataType, IGenericPropertyType } from '@shared/model'
import { GenericDataTypeService } from '@shared/service/generic-data-type.service'
import { GenericPropertyTypeService } from '@shared/service/generic-property-type.service'

@Component({
  selector: 'app-generic-property-type-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './generic-property-type-form.component.html',
  styleUrls: ['./generic-property-type-form.component.scss']
})
export class GenericPropertyTypeFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly fb = inject(FormBuilder)
  private readonly genericDataTypeService = inject(GenericDataTypeService)
  private readonly genericPropertyTypeService = inject(GenericPropertyTypeService)
  private readonly snackBar = inject(MatSnackBar)
  private readonly dialogRef = inject(MatDialogRef<GenericPropertyTypeFormComponent>, { optional: true })
  private readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as { idGenericDataType: string, idPropertyType?: string }

  @Output() propertyTypeSaved = new EventEmitter<IGenericPropertyType>()
  @Output() cancelled = new EventEmitter<void>()

  propertyTypeForm: FormGroup
  isLoading = false
  isSaving = false
  currentPropertyType: IGenericPropertyType | null = null
  genericDataType: IGenericDataType | null = null

  constructor() {
    this.propertyTypeForm = this.fb.group({
      genericDataTypeName: [''],
      name: ['', Validators.required],
      description: [''],
      length: [0, [Validators.min(0)]],
      scale: [0, [Validators.min(0)]],
      isNullable: [false],
      defaultValue: [''],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    if (this.data?.idGenericDataType) {
      this.loadGenericDataType(this.data.idGenericDataType)
      
      if (this.data.idPropertyType) {
        this.loadPropertyType(this.data.idPropertyType)
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private loadGenericDataType(idGenericDataType: string): void {
    this.genericDataTypeService.get(idGenericDataType).pipe(takeUntil(this.destroy$)).subscribe({
      next: (genericDataType) => {
        if (genericDataType) {
          this.genericDataType = genericDataType
          this.propertyTypeForm.patchValue({
            genericDataTypeName: genericDataType.name
          })
        }
      },
      error: (error) => {
        console.error('Error loading generic data type:', error)
        this.showError('Failed to load generic data type information')
      }
    })
  }

  private loadPropertyType(idPropertyType: string): void {
    this.isLoading = true
    this.genericPropertyTypeService.get(idPropertyType).pipe(takeUntil(this.destroy$)).subscribe({
      next: (propertyType) => {
        if (propertyType) {
          this.currentPropertyType = propertyType
          this.propertyTypeForm.patchValue({
            name: propertyType.name,
            description: propertyType.description,
            length: propertyType.length,
            scale: propertyType.scale,
            isNullable: propertyType.isNullable,
            defaultValue: propertyType.defaultValue,
            isActive: propertyType.isActive
          })
        }
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading property type:', error)
        this.showError('Failed to load property type')
        this.isLoading = false
      }
    })
  }

  onSave(): void {
    if (this.propertyTypeForm.invalid || !this.genericDataType) return

    this.isSaving = true
    const formData = this.propertyTypeForm.value

    const propertyTypeData: IGenericPropertyType = {
      ...this.currentPropertyType,
      ...formData,
      idGenericDataType: this.genericDataType.id,
      genericDataTypeName: this.genericDataType.name,
      idValidation: '', // Will be set by backend
      validationName: ''  // Will be set by backend
    }

    const saveOperation = this.currentPropertyType
      ? this.genericPropertyTypeService.update(propertyTypeData)
      : this.genericPropertyTypeService.create(propertyTypeData)

    saveOperation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.isSaving = false
        const message = this.currentPropertyType ? 'Property type updated successfully' : 'Property type created successfully'
        this.showSuccess(message)
        
        if (this.dialogRef) {
          this.dialogRef.close(result)
        } else {
          // Reload the property type to get the complete object
          if (result.id) {
            this.genericPropertyTypeService.get(result.id).pipe(takeUntil(this.destroy$)).subscribe({
              next: (propertyType) => {
                if (propertyType) {
                  this.propertyTypeSaved.emit(propertyType)
                }
              },
              error: (error) => {
                console.error('Error reloading property type:', error)
                this.propertyTypeSaved.emit(propertyTypeData)
              }
            })
          } else {
            this.propertyTypeSaved.emit(propertyTypeData)
          }
        }
      },
      error: (error) => {
        console.error('Error saving property type:', error)
        this.isSaving = false
        this.showError('Failed to save property type')
      }
    })
  }

  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close(false)
    } else {
      this.cancelled.emit()
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.propertyTypeForm.get(fieldName)
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
      length: 'Length',
      scale: 'Scale'
    }
    return displayNames[fieldName] || fieldName
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    })
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    })
  }
}
