/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { ProfileCompleteGuard } from './auth/guards/profile-complete.guard';
import { HomeComponent } from './home/home.component';
import { HelpComponent } from './help/help.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'help',
    component: HelpComponent
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)  },  {
    path: 'dashboard',
    canActivate: [AuthGuard, ProfileCompleteGuard],
    component: DashboardComponent
  },  {
    path: 'complete-profile',
    redirectTo: '/users/profile',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    redirectTo: '/users/profile',
    pathMatch: 'full'
  },
  {
    path: 'settings',
    canActivate: [AuthGuard, ProfileCompleteGuard],
    component: SettingsComponent
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
