/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { ProjectService } from '@shared/service/project.service'
import { IProject } from '@shared/model'
import { IProjectPostDTO, IProjectPutDTO } from '@shared/dto'

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private fb = inject(FormBuilder)
  private destroy$ = new Subject<void>()

  projectForm: FormGroup
  isEditMode = false
  loading = false
  saving = false
  projectId: string | null = null
  project: IProject | null = null

  constructor() {
    this.projectForm = this.fb.group({
      idSchema: ['', [Validators.required, Validators.maxLength(50)]],
      schemaName: ['', [Validators.required, Validators.maxLength(100)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      domain: ['', [Validators.required, Validators.maxLength(100)]],
      artifact: ['', [Validators.required, Validators.maxLength(100)]],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.projectId = params.get('id')
        this.isEditMode = !!this.projectId
        
        if (this.isEditMode && this.projectId) {
          this.loadProject(this.projectId)
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private loadProject(id: string): void {
    this.loading = true
    
    this.projectService.get(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project) => {
          if (project) {
            this.project = project
            this.populateForm(project)
          } else {
            this.router.navigate(['/project'])
          }
          this.loading = false
        },
        error: (error) => {
          console.error('Error loading project:', error)
          this.loading = false
          this.router.navigate(['/project'])
        }
      })
  }

  private populateForm(project: IProject): void {
    this.projectForm.patchValue({
      idSchema: project.idSchema,
      schemaName: project.schemaName,
      name: project.name,
      description: project.description,
      domain: project.domain,
      artifact: project.artifact,
      isActive: project.isActive
    })
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.saving = true
      
      const formValue = this.projectForm.value
      
      if (this.isEditMode && this.project) {
        const updateData: IProjectPutDTO = {
          id: this.project.id,
          idSchema: formValue.idSchema,
          schemaName: formValue.schemaName,
          name: formValue.name,
          description: formValue.description,
          domain: formValue.domain,
          artifact: formValue.artifact,
          isActive: formValue.isActive,
          updatedAt: this.project.updatedAt,
          updatedBy: 'Current User' // TODO: Get from auth service
        }
        
        this.projectService.update(updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.saving = false
              this.router.navigate(['/project', this.projectId])
            },
            error: (error) => {
              console.error('Error updating project:', error)
              this.saving = false
            }
          })
      } else {
        const createData: IProjectPostDTO = {
          idSchema: formValue.idSchema,
          schemaName: formValue.schemaName,
          name: formValue.name,
          description: formValue.description,
          domain: formValue.domain,
          artifact: formValue.artifact,
          isActive: formValue.isActive,
          createdBy: 'Current User', // TODO: Get from auth service
          updatedBy: 'Current User'  // TODO: Get from auth service
        }
        
        this.projectService.create(createData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.saving = false
              if (response.id) {
                this.router.navigate(['/project', response.id])
              } else {
                this.router.navigate(['/project'])
              }
            },
            error: (error) => {
              console.error('Error creating project:', error)
              this.saving = false
            }
          })
      }
    } else {
      this.markFormGroupTouched()
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.projectForm.controls).forEach(key => {
      const control = this.projectForm.get(key)
      control?.markAsTouched()
    })
  }

  onCancel(): void {
    if (this.isEditMode && this.projectId) {
      this.router.navigate(['/project', this.projectId])
    } else {
      this.router.navigate(['/project'])
    }
  }

  getFieldError(fieldName: string): string | null {
    const control = this.projectForm.get(fieldName)
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} is too long`
      }
    }
    return null
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      idSchema: 'Schema ID',
      schemaName: 'Schema Name',
      name: 'Project Name',
      description: 'Description',
      domain: 'Domain',
      artifact: 'Artifact'
    }
    return labels[fieldName] || fieldName
  }
}
