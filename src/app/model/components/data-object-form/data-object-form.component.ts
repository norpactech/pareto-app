/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { DataObjectService } from '@shared/service/data-object.service'
import { SchemaStateService } from '@shared/state/schema-state.service'
import { IDataObject } from '@shared/model'
import { IDataObjectPostDTO, IDataObjectPutDTO } from '@shared/dto'

export interface DataObjectFormData {
  dataObject?: IDataObject
  mode: 'create' | 'edit'
}

@Component({
  selector: 'app-data-object-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="data-object-form">
      <h2 mat-dialog-title>
        <mat-icon>{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
        {{ isEditMode ? 'Edit' : 'Create' }} Data Object
      </h2>

      <form [formGroup]="dataObjectForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-grid">
            <!-- Name -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter data object name">
              <mat-error *ngIf="dataObjectForm.get('name')?.hasError('required')">
                Name is required
              </mat-error>
              <mat-error *ngIf="dataObjectForm.get('name')?.hasError('pattern')">
                Name must be a valid identifier (letters, numbers, underscore)
              </mat-error>
            </mat-form-field>

            <!-- Description -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" 
                       placeholder="Enter description" 
                       rows="3"></textarea>
              <mat-error *ngIf="dataObjectForm.get('description')?.hasError('required')">
                Description is required
              </mat-error>
            </mat-form-field>

            <!-- Options -->
            <div class="options-section">
              <h3>Options</h3>
              
              <mat-checkbox formControlName="hasIdentifier">
                <span class="checkbox-label">
                  <strong>Has Identifier</strong>
                  <small>Include an auto-generated ID field</small>
                </span>
              </mat-checkbox>

              <mat-checkbox formControlName="hasAudit">
                <span class="checkbox-label">
                  <strong>Has Audit Fields</strong>
                  <small>Include created/updated timestamp and user fields</small>
                </span>
              </mat-checkbox>

              <mat-checkbox formControlName="hasActive">
                <span class="checkbox-label">
                  <strong>Has Active Flag</strong>
                  <small>Include an active/inactive status field</small>
                </span>
              </mat-checkbox>
            </div>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()" [disabled]="isSubmitting">
            Cancel
          </button>
          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="dataObjectForm.invalid || isSubmitting">
            <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
            <span *ngIf="!isSubmitting">
              {{ isEditMode ? 'Update' : 'Create' }}
            </span>
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .data-object-form {
      min-width: 500px;
      max-width: 600px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1rem 0;
      
      mat-icon {
        color: var(--primary-500);
      }
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .options-section {
      margin-top: 1rem;
      
      h3 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
        font-size: 1rem;
        font-weight: 500;
      }
      
      mat-checkbox {
        display: block;
        margin-bottom: 1rem;
        
        .checkbox-label {
          display: flex;
          flex-direction: column;
          margin-left: 0.5rem;
          
          strong {
            color: var(--text-primary);
            font-weight: 500;
          }
          
          small {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }
        }
      }
    }

    mat-dialog-actions {
      margin-top: 1.5rem;
      gap: 0.5rem;
    }

    mat-spinner {
      margin-right: 0.5rem;
    }

    // Responsive design
    @media (max-width: 600px) {
      .data-object-form {
        min-width: 100%;
        max-width: 100%;
      }
    }
  `]
})
export class DataObjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder)
  private readonly dataObjectService = inject(DataObjectService)
  private readonly schemaStateService = inject(SchemaStateService)
  private readonly dialogRef = inject(MatDialogRef<DataObjectFormComponent>)
  public readonly data = inject<DataObjectFormData>(MAT_DIALOG_DATA)

  dataObjectForm!: FormGroup
  isSubmitting = false
  isEditMode = false

  ngOnInit(): void {
    this.isEditMode = this.data.mode === 'edit'
    this.initForm()
    
    if (this.isEditMode && this.data.dataObject) {
      this.populateForm(this.data.dataObject)
    }
  }

  private initForm(): void {
    this.dataObjectForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/) // Valid identifier pattern
      ]],
      description: ['', [Validators.required]],
      hasIdentifier: [true],
      hasAudit: [true],
      hasActive: [true]
    })
  }

  private populateForm(dataObject: IDataObject): void {
    this.dataObjectForm.patchValue({
      name: dataObject.name,
      description: dataObject.description,
      hasIdentifier: dataObject.hasIdentifier,
      hasAudit: dataObject.hasAudit,
      hasActive: dataObject.hasActive
    })
  }

  onSubmit(): void {
    if (this.dataObjectForm.invalid) {
      return
    }

    const currentSchema = this.schemaStateService.currentSchema
    if (!currentSchema) {
      console.error('No schema selected')
      return
    }

    this.isSubmitting = true

    if (this.isEditMode) {
      this.updateDataObject()
    } else {
      this.createDataObject()
    }
  }

  private createDataObject(): void {
    const formValue = this.dataObjectForm.value
    const currentSchema = this.schemaStateService.currentSchema!

    const createData: IDataObjectPostDTO = {
      idSchema: currentSchema.id,
      name: formValue.name,
      description: formValue.description,
      hasIdentifier: formValue.hasIdentifier,
      hasAudit: formValue.hasAudit,
      hasActive: formValue.hasActive,
      createdBy: 'current-user' // TODO: Get from auth service
    }

    this.dataObjectService.create(createData).subscribe({
      next: (response) => {
        console.log('Data object created:', response)
        // Create a mock data object for the response since the API might not return the full object
        const newDataObject: IDataObject = {
          id: response.id || 'temp-id',
          idSchema: currentSchema.id,
          schemaName: currentSchema.name,
          name: formValue.name,
          description: formValue.description,
          hasIdentifier: formValue.hasIdentifier,
          hasAudit: formValue.hasAudit,
          hasActive: formValue.hasActive,
          createdAt: new Date(),
          createdBy: 'current-user',
          updatedAt: new Date(),
          updatedBy: 'current-user',
          isActive: true
        }
        this.dialogRef.close({ success: true, data: response, dataObject: newDataObject })
      },
      error: (error) => {
        console.error('Error creating data object:', error)
        this.isSubmitting = false
      }
    })
  }

  private updateDataObject(): void {
    if (!this.data.dataObject) {
      return
    }

    const formValue = this.dataObjectForm.value
    const dataObject = this.data.dataObject

    const updateData: IDataObjectPutDTO = {
      id: dataObject.id,
      name: formValue.name,
      description: formValue.description,
      hasIdentifier: formValue.hasIdentifier,
      hasAudit: formValue.hasAudit,
      hasActive: formValue.hasActive,
      updatedAt: dataObject.updatedAt,
      updatedBy: 'current-user' // TODO: Get from auth service
    }

    this.dataObjectService.update(updateData).subscribe({
      next: (response) => {
        console.log('Data object updated:', response)
        // Create updated data object for the response
        const updatedDataObject: IDataObject = {
          ...dataObject,
          name: formValue.name,
          description: formValue.description,
          hasIdentifier: formValue.hasIdentifier,
          hasAudit: formValue.hasAudit,
          hasActive: formValue.hasActive,
          updatedAt: new Date(),
          updatedBy: 'current-user'
        }
        this.dialogRef.close({ success: true, data: response, dataObject: updatedDataObject })
      },
      error: (error) => {
        console.error('Error updating data object:', error)
        this.isSubmitting = false
      }
    })
  }

  onCancel(): void {
    this.dialogRef.close({ success: false })
  }
}
