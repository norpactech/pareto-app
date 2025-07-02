/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Routes } from '@angular/router'
import { AuthGuard } from '../auth/guards/auth.guard'
import { PluginListComponent } from './components/plugin-list/plugin-list.component'
import { PluginDetailComponent } from './components/plugin-detail/plugin-detail.component'

export const SETTINGS_ROUTES: Routes = [
  {
    path: 'plugins',
    component: PluginListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'plugins/new',
    component: PluginDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'plugins/:id',
    component: PluginDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'plugins',
    pathMatch: 'full'
  }
]
