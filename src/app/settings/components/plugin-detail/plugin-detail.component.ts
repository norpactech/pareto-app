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
import { MatSelectModule } from '@angular/material/select'
import { MatCardModule } from '@angular/material/card'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ActivatedRoute, Router } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import { IPlugin, IContext } from '@shared/model'
import { PluginService } from '@shared/service/plugin.service'
import { ContextService } from '@shared/service/context.service'

@Component({
  selector: 'app-plugin-detail',
  standalone: true,
  templateUrl: './plugin-detail.component.html',
  styleUrls: ['./plugin-detail.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTooltipModule,
  ]
})
export class PluginDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly fb = inject(FormBuilder)
  private readonly pluginService = inject(PluginService)
  private readonly contextService = inject(ContextService)
  private readonly snackBar = inject(MatSnackBar)
  private readonly dialogRef = inject(MatDialogRef<PluginDetailComponent>, { optional: true })
  private readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as { idPlugin?: string }

  @Output() pluginSaved = new EventEmitter<IPlugin>()
  @Output() cancelled = new EventEmitter<void>()

  idPlugin: string | null = null
  plugin: IPlugin | null = null
  contexts: IContext[] = []
  pluginForm: FormGroup
  loading = false
  saving = false
  isNew = false

  constructor() {
    this.pluginForm = this.fb.group({
      name: ['', Validators.required],
      idContext: ['', Validators.required],
      description: [''],
      pluginService: ['', Validators.required],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    this.loadContexts()
    // Use dialog data if present
    const id = this.data?.idPlugin ?? this.idPlugin
    this.idPlugin = id
    this.isNew = id === 'new' || !id
    if (!this.isNew && this.idPlugin) {
      this.loadPlugin()
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadContexts(): void {
    const params = { isActive: true, sortColumn: 'name', sortDirection: 'asc' }
    this.contextService.find(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: { data: IContext[]; total: number }) => {
        this.contexts = result.data || []
      },
      error: (error) => {
        console.error('Error loading contexts:', error)
        this.contexts = []
      }
    })
  }

  loadPlugin(): void {
    if (!this.idPlugin) return

    this.loading = true
    this.pluginService.get(this.idPlugin).pipe(takeUntil(this.destroy$)).subscribe({
      next: (plugin: IPlugin | null) => {
        if (plugin) {
          this.plugin = plugin
          this.pluginForm.patchValue({
            name: plugin.name,
            idContext: plugin.idContext,
            description: plugin.description,
            pluginService: plugin.pluginService,
            isActive: plugin.isActive
          })
        }
        this.loading = false
      },
      error: (error) => {
        console.error('Error loading plugin:', error)
        this.loading = false
      }
    })
  }

  cancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close(false)
    } else {
      this.cancelled.emit()
    }
  }

  savePlugin(): void {
    if (this.pluginForm.invalid) return

    this.saving = true
    const formData = this.pluginForm.value

    // Find selected context to get context name
    const selectedContext = this.contexts.find(c => c.id === formData.idContext)
    
    const pluginData: IPlugin = this.isNew 
      ? { ...formData, contextName: selectedContext?.name || '' }
      : { ...this.plugin, ...formData, contextName: selectedContext?.name || this.plugin?.contextName || '' }

    const saveOperation = this.isNew
      ? this.pluginService.create(pluginData)
      : this.pluginService.update(pluginData)

    saveOperation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.saving = false
        this.showSuccess(this.isNew ? 'Plugin created successfully' : 'Plugin updated successfully')
        if (this.dialogRef) {
          this.dialogRef.close(result)
        } else {
          this.pluginSaved.emit(pluginData)
        }
      },
      error: (error) => {
        console.error('Error saving plugin:', error)
        this.saving = false
        this.showError('Failed to save plugin')
      }
    })
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

  getErrorMessage(fieldName: string): string {
    const control = this.pluginForm.get(fieldName)
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`
    }
    return ''
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      name: 'Name',
      idContext: 'Context',
      pluginService: 'Plugin Service'
    }
    return displayNames[fieldName] || fieldName
  }
}
