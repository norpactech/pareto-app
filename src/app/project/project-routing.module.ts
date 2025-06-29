/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ProjectManagementComponent } from './components/project-management/project-management.component'
import { ProjectFormComponent } from './components/project-form/project-form.component'
import { AuthGuard } from '../auth/guards/auth.guard'

const routes: Routes = [
  {
    path: '',
    component: ProjectManagementComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage',
    component: ProjectManagementComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'new',
    component: ProjectFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id/edit',
    component: ProjectFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule { }
