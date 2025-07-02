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

import { IGenericDataType } from '@shared/model'
import { GenericDataTypeService } from '@shared/service/generic-data-type.service'

@Component({
  selector: 'app-generic-data-type-form',
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
  templateUrl: './generic-data-type-form.component.html',
  styleUrls: ['./generic-data-type-form.component.scss']
})
export class GenericDataTypeFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly fb = inject(FormBuilder)
  private readonly genericDataTypeService = inject(GenericDataTypeService)
  private readonly snackBar = inject(MatSnackBar)
  private readonly dialogRef = inject(MatDialogRef<GenericDataTypeFormComponent>, { optional: true })
  private readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as { idGenericDataType?: string }

  @Output() genericDataTypeSaved = new EventEmitter<IGenericDataType>()
  @Output() cancelled = new EventEmitter<void>()

  genericDataTypeForm: FormGroup
  isLoading = false
  isSaving = false
  currentGenericDataType: IGenericDataType | null = null

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
    if (this.data?.idGenericDataType) {
      this.loadGenericDataType(this.data.idGenericDataType)
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private loadGenericDataType(idGenericDataType: string): void {
    this.isLoading = true
    this.genericDataTypeService.get(idGenericDataType).pipe(takeUntil(this.destroy$)).subscribe({
      next: (genericDataType) => {
        if (genericDataType) {
          this.currentGenericDataType = genericDataType
          this.genericDataTypeForm.patchValue({
            name: genericDataType.name,
            description: genericDataType.description,
            alias: genericDataType.alias,
            sequence: genericDataType.sequence,
            isActive: genericDataType.isActive
          })
        }
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading generic data type:', error)
        this.showError('Failed to load generic data type')
        this.isLoading = false
      }
    })
  }

  onSave(): void {
    if (this.genericDataTypeForm.invalid) return

    this.isSaving = true
    const formData = this.genericDataTypeForm.value

    const genericDataTypeData: IGenericDataType = this.currentGenericDataType
      ? { ...this.currentGenericDataType, ...formData }
      : { ...formData, idTenant: 'system', tenantName: 'System' }

    const saveOperation = this.currentGenericDataType
      ? this.genericDataTypeService.update(genericDataTypeData)
      : this.genericDataTypeService.create(genericDataTypeData)

    saveOperation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.isSaving = false
        const message = this.currentGenericDataType ? 'Generic data type updated successfully' : 'Generic data type created successfully'
        this.showSuccess(message)
        
        if (this.dialogRef) {
          this.dialogRef.close(result)
        } else {
          // Reload the generic data type to get the complete object
          if (result.id) {
            this.genericDataTypeService.get(result.id).pipe(takeUntil(this.destroy$)).subscribe({
              next: (genericDataType) => {
                if (genericDataType) {
                  this.genericDataTypeSaved.emit(genericDataType)
                }
              },
              error: (error) => {
                console.error('Error reloading generic data type:', error)
                this.genericDataTypeSaved.emit(genericDataTypeData)
              }
            })
          } else {
            this.genericDataTypeSaved.emit(genericDataTypeData)
          }
        }
      },
      error: (error) => {
        console.error('Error saving generic data type:', error)
        this.isSaving = false
        this.showError('Failed to save generic data type')
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
