/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'

import { DataObjectListComponent } from '../data-object-list/data-object-list.component'

@Component({
  selector: 'app-model-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    DataObjectListComponent
  ],
  template: `
    <div class="model-page-container">
      <div class="content-area">
        <app-data-object-list></app-data-object-list>
      </div>
    </div>
  `,
  styles: [`
    .model-page-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--surface-50);
      overflow: hidden;
    }

    .content-area {
      flex: 1;
      margin: 1rem;
      background: white;
      border-radius: 8px;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
    }

    // Responsive design
    @media (max-width: 768px) {
      .content-area {
        margin: 0.5rem;
      }
    }
  `]
})
export class ModelPageComponent {
  // This component serves as a container for the model management features
}