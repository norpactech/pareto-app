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
import { MatSelectModule } from '@angular/material/select'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Subject, takeUntil } from 'rxjs'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import { IContext, IContextPropertyType, IGenericPropertyType } from '@shared/model'
import { ContextService } from '@shared/service/context.service'
import { ContextPropertyTypeService } from '@shared/service/context-property-type.service'
import { GenericPropertyTypeService } from '@shared/service/generic-property-type.service'

@Component({
  selector: 'app-context-property-type-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './context-property-type-form.component.html',
  styleUrls: ['./context-property-type-form.component.scss']
})
export class ContextPropertyTypeFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly fb = inject(FormBuilder)
  private readonly contextService = inject(ContextService)
  private readonly contextPropertyTypeService = inject(ContextPropertyTypeService)
  private readonly genericPropertyTypeService = inject(GenericPropertyTypeService)
  private readonly snackBar = inject(MatSnackBar)
  private readonly dialogRef = inject(MatDialogRef<ContextPropertyTypeFormComponent>, { optional: true })
  private readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as { idContext: string, idPropertyType?: string }

  @Output() propertyTypeSaved = new EventEmitter<IContextPropertyType>()
  @Output() cancelled = new EventEmitter<void>()

  propertyTypeForm: FormGroup
  isLoading = false
  isSaving = false
  currentPropertyType: IContextPropertyType | null = null
  context: IContext | null = null
  genericPropertyTypes: IGenericPropertyType[] = []

  constructor() {
    this.propertyTypeForm = this.fb.group({
      contextName: [''],
      idGenericPropertyType: ['', Validators.required],
      length: [0, [Validators.min(0)]],
      scale: [0, [Validators.min(0)]],
      isNullable: [false],
      defaultValue: [''],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    this.loadGenericPropertyTypes()
    
    if (this.data?.idContext) {
      this.loadContext(this.data.idContext)
      
      if (this.data.idPropertyType) {
        this.loadPropertyType(this.data.idPropertyType)
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
          this.propertyTypeForm.patchValue({
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

  private loadGenericPropertyTypes(): void {
    this.isLoading = true
    this.genericPropertyTypeService.find({ isActive: true }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: { data: IGenericPropertyType[] }) => {
        this.genericPropertyTypes = result.data || []
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading generic property types:', error)
        this.showError('Failed to load generic property types')
        this.isLoading = false
      }
    })
  }

  private loadPropertyType(idPropertyType: string): void {
    this.isLoading = true
    this.contextPropertyTypeService.get(idPropertyType).pipe(takeUntil(this.destroy$)).subscribe({
      next: (propertyType) => {
        if (propertyType) {
          this.currentPropertyType = propertyType
          this.propertyTypeForm.patchValue({
            idGenericPropertyType: propertyType.idGenericPropertyType,
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
    if (this.propertyTypeForm.invalid || !this.context) return

    this.isSaving = true
    const formData = this.propertyTypeForm.value

    const propertyTypeData: IContextPropertyType = {
      ...this.currentPropertyType,
      ...formData,
      idContext: this.context.id,
      contextName: this.context.name,
      genericPropertyTypeName: this.getGenericPropertyTypeName(formData.idGenericPropertyType)
    }

    const saveOperation = this.currentPropertyType
      ? this.contextPropertyTypeService.update(propertyTypeData)
      : this.contextPropertyTypeService.create(propertyTypeData)

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
            this.contextPropertyTypeService.get(result.id).pipe(takeUntil(this.destroy$)).subscribe({
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
      idGenericPropertyType: 'Generic Property Type',
      length: 'Length',
      scale: 'Scale'
    }
    return displayNames[fieldName] || fieldName
  }

  private getGenericPropertyTypeName(idGenericPropertyType: string): string {
    const type = this.genericPropertyTypes.find(t => t.id === idGenericPropertyType)
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
