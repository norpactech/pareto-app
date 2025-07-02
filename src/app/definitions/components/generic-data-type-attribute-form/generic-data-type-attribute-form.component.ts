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

import { IGenericDataType, IGenericDataTypeAttribute } from '@shared/model'
import { GenericDataTypeService } from '@shared/service/generic-data-type.service'
import { GenericDataTypeAttributeService } from '@shared/service/generic-data-type-attribute.service'

@Component({
  selector: 'app-generic-data-type-attribute-form',
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
  templateUrl: './generic-data-type-attribute-form.component.html',
  styleUrls: ['./generic-data-type-attribute-form.component.scss']
})
export class GenericDataTypeAttributeFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly fb = inject(FormBuilder)
  private readonly genericDataTypeService = inject(GenericDataTypeService)
  private readonly genericDataTypeAttributeService = inject(GenericDataTypeAttributeService)
  private readonly snackBar = inject(MatSnackBar)
  private readonly dialogRef = inject(MatDialogRef<GenericDataTypeAttributeFormComponent>, { optional: true })
  private readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as { idGenericDataType: string, idAttribute?: string }

  @Output() attributeSaved = new EventEmitter<IGenericDataTypeAttribute>()
  @Output() cancelled = new EventEmitter<void>()

  attributeForm: FormGroup
  isLoading = false
  isSaving = false
  currentAttribute: IGenericDataTypeAttribute | null = null
  genericDataType: IGenericDataType | null = null

  constructor() {
    this.attributeForm = this.fb.group({
      genericDataTypeName: [''],
      name: ['', Validators.required],
      description: [''],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    if (this.data?.idGenericDataType) {
      this.loadGenericDataType(this.data.idGenericDataType)
      
      if (this.data.idAttribute) {
        this.loadAttribute(this.data.idAttribute)
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
          this.attributeForm.patchValue({
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

  private loadAttribute(idAttribute: string): void {
    this.isLoading = true
    this.genericDataTypeAttributeService.get(idAttribute).pipe(takeUntil(this.destroy$)).subscribe({
      next: (attribute) => {
        if (attribute) {
          this.currentAttribute = attribute
          this.attributeForm.patchValue({
            name: attribute.name,
            description: attribute.description,
            isActive: attribute.isActive
          })
        }
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading attribute:', error)
        this.showError('Failed to load attribute')
        this.isLoading = false
      }
    })
  }

  onSave(): void {
    if (this.attributeForm.invalid || !this.genericDataType) return

    this.isSaving = true
    const formData = this.attributeForm.value

    const attributeData: IGenericDataTypeAttribute = {
      ...this.currentAttribute,
      ...formData,
      idGenericDataType: this.genericDataType.id,
      genericDataTypeName: this.genericDataType.name,
      idRtAttrDataType: '' // Will be set by backend
    }

    const saveOperation = this.currentAttribute
      ? this.genericDataTypeAttributeService.update(attributeData)
      : this.genericDataTypeAttributeService.create(attributeData)

    saveOperation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.isSaving = false
        const message = this.currentAttribute ? 'Attribute updated successfully' : 'Attribute created successfully'
        this.showSuccess(message)
        
        if (this.dialogRef) {
          this.dialogRef.close(result)
        } else {
          // Reload the attribute to get the complete object
          if (result.id) {
            this.genericDataTypeAttributeService.get(result.id).pipe(takeUntil(this.destroy$)).subscribe({
              next: (attribute) => {
                if (attribute) {
                  this.attributeSaved.emit(attribute)
                }
              },
              error: (error) => {
                console.error('Error reloading attribute:', error)
                this.attributeSaved.emit(attributeData)
              }
            })
          } else {
            this.attributeSaved.emit(attributeData)
          }
        }
      },
      error: (error) => {
        console.error('Error saving attribute:', error)
        this.isSaving = false
        this.showError('Failed to save attribute')
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
    const control = this.attributeForm.get(fieldName)
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`
    }
    return ''
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      name: 'Name'
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
