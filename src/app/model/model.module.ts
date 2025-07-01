/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ModelRoutingModule } from './model-routing.module'
import { ModelPageComponent } from './components/model-page/model-page.component'
import { ModelTreeComponent } from './components/model-tree/model-tree.component'
import { DataObjectListComponent } from './components/data-object-list/data-object-list.component'
import { DataObjectFormComponent } from './components/data-object-form/data-object-form.component'

@NgModule({
  imports: [
    CommonModule,
    ModelRoutingModule,
    ModelPageComponent,
    ModelTreeComponent,
    DataObjectListComponent,
    DataObjectFormComponent
  ]
})
export class ModelModule { }
