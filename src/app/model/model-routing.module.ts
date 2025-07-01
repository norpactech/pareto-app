/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AuthGuard } from '../auth/guards/auth.guard'
import { ProfileCompleteGuard } from '../auth/guards/profile-complete.guard'
import { ModelPageComponent } from './components/model-page/model-page.component'

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, ProfileCompleteGuard],
    component: ModelPageComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelRoutingModule { }
