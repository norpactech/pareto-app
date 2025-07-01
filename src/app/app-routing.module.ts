/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AuthGuard } from '../auth/guards/auth.guard'

const routes: Routes = [
  {
    path: 'definitions',
    loadChildren: () =>
      import('./definitions/definitions.module').then((m) => m.DefinitionsModule),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'definitions',
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}