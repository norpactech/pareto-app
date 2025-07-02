/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { GenericDataTypeListComponent } from './components/generic-data-type-list/generic-data-type-list.component'
import { GenericDataTypeDetailComponent } from './components/generic-data-type-detail/generic-data-type-detail.component'
import { ContextListComponent } from './components/context-list/context-list.component'
import { AuthGuard } from '../auth/guards/auth.guard'
import { ContextDetailComponent } from './components/context-detail/context-detail.component'
import { ContextDataTypeListComponent } from './components/context-data-type-list/context-data-type-list.component'
import { ContextDataTypeFormComponent } from './components/context-data-type-form/context-data-type-form.component'

const routes: Routes = [
  {
    path: 'generic',
    component: GenericDataTypeListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'generic/new',
    component: GenericDataTypeDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'generic/:id',
    component: GenericDataTypeDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'context',
    component: ContextListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'context/:id',
    component: ContextDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'context/:id/data-types',
    component: ContextDataTypeListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'context/:id/data-types/new',
    component: ContextDataTypeFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'context/:id/data-types/:dataTypeId',
    component: ContextDataTypeFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'generic',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'generic'
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DefinitionsRoutingModule { }