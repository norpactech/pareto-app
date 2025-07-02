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
import { MatCardModule } from '@angular/material/card'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSelectModule } from '@angular/material/select'
import { Subject, takeUntil } from 'rxjs'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import { IContext, IContextDataType, IGenericDataType } from '@shared/model'
import { ContextService } from '@shared/service/context.service'
import { ContextDataTypeService } from '@shared/service/context-data-type.service'
import { GenericDataTypeService } from '@shared/service/generic-data-type.service'

@Component({
  selector: 'app-context-data-type-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSelectModule
  ],
  templateUrl: './context-data-type-form.component.html',
  styleUrls: ['./context-data-type-form.component.scss']
})
export class ContextDataTypeFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly fb = inject(FormBuilder)
  private readonly contextService = inject(ContextService)
  private readonly contextDataTypeService = inject(ContextDataTypeService)
  private readonly genericDataTypeService = inject(GenericDataTypeService)
  private readonly snackBar = inject(MatSnackBar)
  private readonly dialogRef = inject(MatDialogRef<ContextDataTypeFormComponent>, { optional: true })
  private readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as { idContext: string, idDataType?: string }

  @Output() dataTypeSaved = new EventEmitter<IContextDataType>()
  @Output() cancelled = new EventEmitter<void>()

  dataTypeForm: FormGroup
  isLoading = false
  isSaving = false
  currentDataType: IContextDataType | null = null
  context: IContext | null = null
  genericDataTypes: IGenericDataType[] = []

  constructor() {
    this.dataTypeForm = this.fb.group({
      contextName: [''],
      name: ['', Validators.required],
      description: [''],
      alias: [''],
      idGenericDataType: ['', Validators.required],
      sequence: [0, [Validators.required, Validators.min(0)]],
      contextValue: [''],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    this.loadGenericDataTypes()
    
    if (this.data?.idContext) {
      this.loadContext(this.data.idContext)
      
      if (this.data.idDataType) {
        this.loadDataType(this.data.idDataType)
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private loadContext(idContext: string): void {
    this.contextService.get(idContext).pipe(takeUntil(this.destroy$)).subscribe({
      next: (context) => {
        if (context) {
          this.context = context
          this.dataTypeForm.patchValue({
            contextName: context.name
          })
        }
      },
      error: (error) => {
        console.error('Error loading context:', error)
        this.showError('Failed to load context information')
      }
    })
  }

  private loadGenericDataTypes(): void {
    this.isLoading = true
    this.genericDataTypeService.find({ isActive: true }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: { data: IGenericDataType[] }) => {
        this.genericDataTypes = result.data || []
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading generic data types:', error)
        this.showError('Failed to load generic data types')
        this.isLoading = false
      }
    })
  }

  private loadDataType(idDataType: string): void {
    this.isLoading = true
    this.contextDataTypeService.get(idDataType).pipe(takeUntil(this.destroy$)).subscribe({
      next: (dataType) => {
        if (dataType) {
          this.currentDataType = dataType
          this.dataTypeForm.patchValue({
            name: dataType.name,
            description: dataType.description,
            alias: dataType.alias,
            idGenericDataType: dataType.idGenericDataType,
            sequence: dataType.sequence,
            contextValue: dataType.contextValue,
            isActive: dataType.isActive
          })
        }
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading data type:', error)
        this.showError('Failed to load data type')
        this.isLoading = false
      }
    })
  }

  onSave(): void {
    if (this.dataTypeForm.invalid || !this.context) return

    this.isSaving = true
    const formData = this.dataTypeForm.value

    const dataTypeData: IContextDataType = {
      ...this.currentDataType,
      ...formData,
      idContext: this.context.id,
      contextName: this.context.name,
      genericDataTypeName: this.getGenericDataTypeName(formData.idGenericDataType)
    }

    const saveOperation = this.currentDataType
      ? this.contextDataTypeService.update(dataTypeData)
      : this.contextDataTypeService.create(dataTypeData)

    saveOperation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.isSaving = false
        const message = this.currentDataType ? 'Data type updated successfully' : 'Data type created successfully'
        this.showSuccess(message)
        
        if (this.dialogRef) {
          this.dialogRef.close({ ...dataTypeData, ...result })
        } else {
          this.dataTypeSaved.emit({ ...dataTypeData, ...result })
        }
      },
      error: (error) => {
        console.error('Error saving data type:', error)
        this.isSaving = false
        this.showError('Failed to save data type')
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
    const control = this.dataTypeForm.get(fieldName)
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
      idGenericDataType: 'Generic Data Type',
      sequence: 'Sequence'
    }
    return displayNames[fieldName] || fieldName
  }

  private getGenericDataTypeName(idGenericDataType: string): string {
    const type = this.genericDataTypes.find(t => t.id === idGenericDataType)
    return type?.name || ''
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