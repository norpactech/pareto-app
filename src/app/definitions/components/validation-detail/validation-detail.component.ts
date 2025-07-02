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
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'

import { IValidation } from '@shared/model'
import { ValidationService } from '@shared/service/validation.service'

@Component({
  selector: 'app-validation-detail',
  standalone: true,
  templateUrl: './validation-detail.component.html',
  styleUrls: ['./validation-detail.component.scss'],
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
    RouterLink
  ]
})
export class ValidationDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly fb = inject(FormBuilder)
  private readonly validationService = inject(ValidationService)

  idValidation: string | null = null
  validation: IValidation | null = null
  validationForm: FormGroup
  loading = false
  saving = false
  isNew = false

  constructor() {
    this.validationForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      errorMsg: ['', Validators.required],
      expression: ['', Validators.required],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.idValidation = params.get('id')
      this.isNew = this.idValidation === 'new'
      
      if (!this.isNew && this.idValidation) {
        this.loadValidation()
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadValidation(): void {
    if (!this.idValidation) return

    this.loading = true
    this.validationService.get(this.idValidation).pipe(takeUntil(this.destroy$)).subscribe({
      next: (validation: IValidation | null) => {
        if (validation) {
          this.validation = validation
          this.validationForm.patchValue({
            name: validation.name,
            description: validation.description,
            errorMsg: validation.errorMsg,
            expression: validation.expression,
            isActive: validation.isActive
          })
        }
        this.loading = false
      },
      error: (error) => {
        console.error('Error loading validation:', error)
        this.loading = false
      }
    })
  }

  cancel(): void {
    this.router.navigate(['/definitions/validation'])
  }

  saveValidation(): void {
    if (this.validationForm.invalid) return

    this.saving = true
    const formData = this.validationForm.value

    const validationData: IValidation = this.isNew 
      ? { ...formData, idTenant: 'system', tenantName: 'System', idRtValidationType: '' }
      : { ...this.validation, ...formData }

    const saveOperation = this.isNew
      ? this.validationService.create(validationData)
      : this.validationService.update(validationData)

    saveOperation.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.saving = false
        this.router.navigate(['/definitions/validation'])
      },
      error: (error) => {
        console.error('Error saving validation:', error)
        this.saving = false
      }
    })
  }

  getErrorMessage(fieldName: string): string {
    const control = this.validationForm.get(fieldName)
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`
    }
    return ''
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      name: 'Name',
      errorMsg: 'Error Message',
      expression: 'Expression'
    }
    return displayNames[fieldName] || fieldName
  }
}
