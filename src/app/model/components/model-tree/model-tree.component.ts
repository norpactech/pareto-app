/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatTreeModule } from '@angular/material/tree'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatCardModule } from '@angular/material/card'
import { MatExpansionModule } from '@angular/material/expansion'
import { Subject, takeUntil } from 'rxjs'
import { FlatTreeControl } from '@angular/cdk/tree'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'

import { SchemaStateService } from '@shared/state/schema-state.service'
import { DataObjectStateService } from '@shared/state/data-object-state.service'
import { DataObjectService } from '@shared/service/data-object.service'
import { PropertyService } from '@shared/service/property.service'
import { DataIndexService } from '@shared/service/data-index.service'
import { DataIndexPropertyService } from '@shared/service/data-index-property.service'
import { IDataObject, IProperty, IDataIndex, IDataIndexProperty } from '@shared/model'

// Tree node interfaces
interface ModelTreeNode {
  id: string
  name: string
  type: 'data-object' | 'property' | 'index' | 'index-property'
  level: number
  expandable: boolean
  description?: string
  icon: string
  data?: IDataObject | IProperty | IDataIndex | IDataIndexProperty
  children?: ModelTreeNode[]
}

interface FlatNode {
  expandable: boolean
  name: string
  level: number
  type: 'data-object' | 'property' | 'index' | 'index-property'
  id: string
  description?: string
  icon: string
  data?: IDataObject | IProperty | IDataIndex | IDataIndexProperty
}

@Component({
  selector: 'app-model-tree',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatExpansionModule
  ],
  template: `
    <div class="model-tree-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>account_tree</mat-icon>
            Data Model Structure
          </mat-card-title>
          <mat-card-subtitle *ngIf="currentSchema">
            Schema: {{ currentSchema.name }}
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading model structure...</p>
      </div>

      <!-- No Schema Selected -->
      <div class="no-schema-container" *ngIf="!currentSchema && !loading">
        <mat-card class="info-card">
          <mat-card-content>
            <mat-icon class="large-icon">schema</mat-icon>
            <h3>No Schema Selected</h3>
            <p>Please select a tenant and schema to view the data model structure.</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- No Data Objects -->
      <div class="no-data-container" *ngIf="currentSchema && !loading && dataSource.data.length === 0">
        <mat-card class="info-card">
          <mat-card-content>
            <mat-icon class="large-icon">storage_off</mat-icon>
            <h3>No Data Objects Found</h3>
            <p>No data objects are defined for this schema yet.</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Model Tree -->
      <mat-card class="tree-card" *ngIf="currentSchema && !loading && dataSource.data.length > 0">
        <mat-card-content>
          <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
            <!-- Tree node template -->
            <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding>
              <button mat-icon-button disabled><span></span></button>
              <div class="tree-node-content" [class]="'node-' + node.type">
                <mat-icon class="node-icon">{{ node.icon }}</mat-icon>
                <span class="node-name">{{ node.name }}</span>
                <span class="node-description" *ngIf="node.description">{{ node.description }}</span>
                <span class="node-type-badge">{{ getTypeLabel(node.type) }}</span>
              </div>
            </mat-tree-node>

            <!-- Expandable tree node template -->
            <mat-tree-node *matTreeNodeDef="let node; when: hasChild" matTreeNodePadding>
              <button mat-icon-button matTreeNodeToggle
                      [attr.aria-label]="'Toggle ' + node.name">
                <mat-icon class="mat-icon-rtl-mirror">
                  {{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}
                </mat-icon>
              </button>
              <div class="tree-node-content" [class]="'node-' + node.type">
                <mat-icon class="node-icon">{{ node.icon }}</mat-icon>
                <span class="node-name">{{ node.name }}</span>
                <span class="node-description" *ngIf="node.description">{{ node.description }}</span>
                <span class="node-type-badge">{{ getTypeLabel(node.type) }}</span>
              </div>
            </mat-tree-node>
          </mat-tree>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .model-tree-container {
      padding: 1rem;
      height: 100vh;
      overflow-y: auto;
    }

    .header-card {
      margin-bottom: 1rem;
      
      mat-card-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        mat-icon {
          color: var(--primary-500);
        }
      }
    }

    .loading-container,
    .no-schema-container,
    .no-data-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      text-align: center;
      
      mat-spinner {
        margin-bottom: 1rem;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0.5rem 0;
      }
    }

    .info-card {
      max-width: 400px;
      
      mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        
        .large-icon {
          font-size: 3rem;
          width: 3rem;
          height: 3rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        
        h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }
        
        p {
          margin: 0;
          color: var(--text-secondary);
        }
      }
    }

    .tree-card {
      mat-card-content {
        padding: 0;
      }
    }

    .tree-node-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      width: 100%;
      
      .node-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      
      .node-name {
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .node-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        font-style: italic;
        margin-left: 0.5rem;
      }
      
      .node-type-badge {
        background: var(--surface-200);
        color: var(--text-secondary);
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
        margin-left: auto;
        text-transform: uppercase;
      }
    }

    // Node type specific styling
    .node-data-object {
      .node-icon {
        color: var(--primary-500);
      }
      .node-type-badge {
        background: var(--primary-100);
        color: var(--primary-700);
      }
    }

    .node-property {
      .node-icon {
        color: var(--accent-500);
      }
      .node-type-badge {
        background: var(--accent-100);
        color: var(--accent-700);
      }
    }

    .node-index {
      .node-icon {
        color: var(--success-500);
      }
      .node-type-badge {
        background: var(--success-100);
        color: var(--success-700);
      }
    }

    .node-index-property {
      .node-icon {
        color: var(--warning-500);
      }
      .node-type-badge {
        background: var(--warning-100);
        color: var(--warning-700);
      }
    }

    // Material Tree overrides
    .mat-tree {
      background: transparent;
    }

    .mat-tree-node {
      min-height: 48px;
      border-bottom: 1px solid var(--surface-200);
      
      &:hover {
        background: var(--surface-100);
      }
    }

    // Responsive design
    @media (max-width: 768px) {
      .model-tree-container {
        padding: 0.5rem;
      }
      
      .tree-node-content {
        .node-description {
          display: none; // Hide descriptions on mobile
        }
      }
    }
  `]
})
export class ModelTreeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private readonly schemaStateService = inject(SchemaStateService)
  private readonly dataObjectStateService = inject(DataObjectStateService)
  private readonly dataObjectService = inject(DataObjectService)
  private readonly propertyService = inject(PropertyService)
  private readonly dataIndexService = inject(DataIndexService)
  private readonly dataIndexPropertyService = inject(DataIndexPropertyService)

  currentSchema: { id: string; name: string } | null = null
  loading = false

  // Tree control and data
  private transformer = (node: ModelTreeNode, level: number): FlatNode => {
    return {
      expandable: !!node.expandable,
      name: node.name,
      level: level,
      type: node.type,
      id: node.id,
      description: node.description,
      icon: node.icon,
      data: node.data
    }
  }

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  )

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  )

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)

  ngOnInit(): void {
    console.log('ModelTree: Component initialized')
    this.subscribeToSchemaChanges()
    this.subscribeToDataObjectChanges()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private subscribeToSchemaChanges(): void {
    this.schemaStateService.schema$
      .pipe(takeUntil(this.destroy$))
      .subscribe(schema => {
        console.log('ModelTree: Schema changed:', schema)
        this.currentSchema = schema
        
        if (schema) {
          this.loadModelStructure(schema.id)
        } else {
          this.dataSource.data = []
        }
      })
  }

  private loadModelStructure(schemaId: string): void {
    console.log('ModelTree: Loading model structure for schema:', schemaId)
    this.loading = true

    // Load data objects for the schema
    this.dataObjectService.find({ idSchema: schemaId, isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          console.log('ModelTree: Data objects response:', response)
          const dataObjects = response.data || []
          
          if (dataObjects.length === 0) {
            this.dataSource.data = []
            this.loading = false
            return
          }

          // Build tree structure
          const treeData = await this.buildTreeStructure(dataObjects)
          this.dataSource.data = treeData
          this.loading = false
        },
        error: (error) => {
          console.error('ModelTree: Error loading data objects:', error)
          this.loading = false
        }
      })
  }

  private async buildTreeStructure(dataObjects: IDataObject[]): Promise<ModelTreeNode[]> {
    const treeNodes: ModelTreeNode[] = []

    for (const dataObject of dataObjects) {
      // Create data object node
      const dataObjectNode: ModelTreeNode = {
        id: dataObject.id,
        name: dataObject.name,
        type: 'data-object',
        level: 0,
        expandable: true,
        description: dataObject.description,
        icon: 'table_chart',
        data: dataObject,
        children: []
      }

      // Load properties and indexes for this data object
      const [propertiesResponse, indexesResponse] = await Promise.all([
        this.propertyService.find({ idDataObject: dataObject.id, isActive: true }).toPromise(),
        this.dataIndexService.find({ idDataObject: dataObject.id, isActive: true }).toPromise()
      ])

      const properties = propertiesResponse?.data || []
      const indexes = indexesResponse?.data || []

      // Add property nodes
      for (const property of properties) {
        const propertyNode: ModelTreeNode = {
          id: property.id,
          name: property.name,
          type: 'property',
          level: 1,
          expandable: false,
          description: property.description,
          icon: 'label',
          data: property
        }
        dataObjectNode.children!.push(propertyNode)
      }

      // Add index nodes with their properties
      for (const index of indexes) {
        const indexNode: ModelTreeNode = {
          id: index.id,
          name: index.name,
          type: 'index',
          level: 1,
          expandable: true,
          description: `Index`,
          icon: 'storage',
          data: index,
          children: []
        }

        // Load index properties
        const indexPropsResponse = await this.dataIndexPropertyService.find({ 
          idDataIndex: index.id, 
          isActive: true 
        }).toPromise()

        const indexProperties = indexPropsResponse?.data || []
        
        for (const indexProp of indexProperties) {
          const indexPropertyNode: ModelTreeNode = {
            id: indexProp.id,
            name: indexProp.propertyName,
            type: 'index-property',
            level: 2,
            expandable: false,
            description: `Sequence: ${indexProp.sequence}`,
            icon: 'view_list',
            data: indexProp
          }
          indexNode.children!.push(indexPropertyNode)
        }

        dataObjectNode.children!.push(indexNode)
      }

      treeNodes.push(dataObjectNode)
    }

    return treeNodes
  }

  private subscribeToDataObjectChanges(): void {
    this.dataObjectStateService.changeEvents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        console.log('ModelTree: Data object change event:', event)
        // Only refresh if the change is for the current schema
        if (this.currentSchema && event.schemaId === this.currentSchema.id) {
          console.log('ModelTree: Refreshing tree due to data object change')
          this.loadModelStructure(this.currentSchema.id)
        }
      })
  }

  hasChild = (_: number, node: FlatNode) => node.expandable

  getTypeLabel(type: string): string {
    switch (type) {
      case 'data-object': return 'Object'
      case 'property': return 'Property'
      case 'index': return 'Index'
      case 'index-property': return 'Index Prop'
      default: return type
    }
  }
}
