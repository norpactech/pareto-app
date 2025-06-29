/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'

// Angular Material Modules
import { MatIconModule } from '@angular/material/icon'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatTableModule } from '@angular/material/table'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatSelectModule } from '@angular/material/select'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatTabsModule } from '@angular/material/tabs'
import { MatDividerModule } from '@angular/material/divider'
import { MatListModule } from '@angular/material/list'
import { MatBadgeModule } from '@angular/material/badge'

import { ProjectRoutingModule } from './project-routing.module'
import { ProjectManagementComponent } from './components/project-management/project-management.component'
import { ProjectFormComponent } from './components/project-form/project-form.component'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProjectRoutingModule,
    // Angular Material Modules
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatSidenavModule,
    MatExpansionModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule,
    // Import standalone components
    ProjectManagementComponent,
    ProjectFormComponent
  ]
})
export class ProjectModule { }
