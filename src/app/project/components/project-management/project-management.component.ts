/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute, RouterModule } from '@angular/router'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav'
import { MatTableModule, MatTableDataSource } from '@angular/material/table'
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator'
import { MatSortModule, MatSort } from '@angular/material/sort'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatCardModule } from '@angular/material/card'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatTabsModule } from '@angular/material/tabs'
import { MatDividerModule } from '@angular/material/divider'
import { MatListModule } from '@angular/material/list'
import { MatBadgeModule } from '@angular/material/badge'
import { Subject } from 'rxjs'
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators'

import { ProjectService } from '@shared/service/project.service'
import { ProjectComponentService } from '@shared/service/project-component.service'
import { ProjectComponentPropertyService } from '@shared/service/project-component-property.service'
import { IProject, IProjectComponent, IProjectComponentProperty } from '@shared/model'
import { IProjectComponentPostDTO, IProjectComponentPutDTO } from '@shared/dto'
import { IProjectComponentPropertyPostDTO, IProjectComponentPropertyPutDTO } from '@shared/dto'

interface ProjectHierarchy {
  project: IProject
  components: (IProjectComponent & { properties: IProjectComponentProperty[] })[]
}

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule
  ],
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss']
})
export class ProjectManagementComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService)
  private projectComponentService = inject(ProjectComponentService)
  private projectComponentPropertyService = inject(ProjectComponentPropertyService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private fb = inject(FormBuilder)
  private destroy$ = new Subject<void>()

  @ViewChild('detailsSidenav') detailsSidenav!: MatSidenav
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  // Data sources
  projectsDataSource = new MatTableDataSource<IProject>()
  selectedProjectHierarchy: ProjectHierarchy | null = null
  
  // UI State
  loading = false
  selectedProject: IProject | null = null
  selectedComponent: IProjectComponent | null = null
  selectedProperty: IProjectComponentProperty | null = null
  currentView: 'project' | 'component' | 'property' = 'project'
  
  // Forms
  projectForm: FormGroup
  componentForm: FormGroup
  propertyForm: FormGroup
  searchForm: FormGroup
  
  // Table configurations
  projectColumns: string[] = ['name', 'description', 'domain', 'isActive', 'actions']
  totalItems = 0
  
  // Edit modes
  isEditingProject = false
  isEditingComponent = false
  isEditingProperty = false

  constructor() {
    this.searchForm = this.fb.group({
      searchColumn: ['name'],
      searchValue: [''],
      isActive: [true]
    })

    this.projectForm = this.fb.group({
      idSchema: ['', [Validators.required]],
      schemaName: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      domain: ['', [Validators.required]],
      artifact: ['', [Validators.required]],
      isActive: [true]
    })

    this.componentForm = this.fb.group({
      idProject: ['', [Validators.required]],
      idContext: ['', [Validators.required]],
      idPlugin: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      subPackage: ['', [Validators.required]],
      isActive: [true]
    })

    this.propertyForm = this.fb.group({
      idProjectComponent: ['', [Validators.required]],
      sequence: [1, [Validators.required, Validators.min(1)]],
      dataObjectFilter: ['', [Validators.required]],
      propertyFilter: ['', [Validators.required]],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    this.loadProjects()
    this.setupSearchSubscription()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private setupSearchSubscription(): void {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.loadProjects()
      })
  }

  private loadProjects(): void {
    this.loading = true
    
    const params = {
      page: this.paginator?.pageIndex || 0,
      limit: this.paginator?.pageSize || 10,
      sortColumn: this.sort?.active || 'name',
      sortDirection: this.sort?.direction || 'asc',
      ...this.searchForm.value
    }

    this.projectService.find(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.projectsDataSource.data = response.data
          this.totalItems = response.total
          this.loading = false
        },
        error: (error) => {
          console.error('Error loading projects:', error)
          this.loading = false
        }
      })
  }

  selectProject(project: IProject): void {
    this.selectedProject = project
    this.currentView = 'project'
    this.loadProjectHierarchy(project.id)
    this.detailsSidenav.open()
  }

  private loadProjectHierarchy(projectId: string): void {
    this.loading = true
    
    // Load project components
    this.projectComponentService.find({ idProject: projectId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (componentResponse) => {
          const components = componentResponse.data
          
          // Load properties for each component
          const componentPromises = components.map(component => 
            this.projectComponentPropertyService.find({ idProjectComponent: component.id })
              .pipe(takeUntil(this.destroy$))
              .toPromise()
              .then(propertyResponse => ({
                ...component,
                properties: propertyResponse?.data || []
              }))
          )
          
          Promise.all(componentPromises).then(componentsWithProperties => {
            this.selectedProjectHierarchy = {
              project: this.selectedProject!,
              components: componentsWithProperties
            }
            this.loading = false
          })
        },
        error: (error) => {
          console.error('Error loading project hierarchy:', error)
          this.loading = false
        }
      })
  }

  selectComponent(component: IProjectComponent): void {
    this.selectedComponent = component
    this.currentView = 'component'
  }

  selectProperty(property: IProjectComponentProperty): void {
    this.selectedProperty = property
    this.currentView = 'property'
  }

  // Form operations
  startEditProject(): void {
    if (this.selectedProject) {
      this.isEditingProject = true
      this.projectForm.patchValue(this.selectedProject)
    }
  }

  cancelEditProject(): void {
    this.isEditingProject = false
    this.projectForm.reset()
  }

  saveProject(): void {
    if (this.projectForm.valid && this.selectedProject) {
      const formValue = this.projectForm.value
      const updateData = {
        ...formValue,
        id: this.selectedProject.id,
        updatedAt: this.selectedProject.updatedAt,
        updatedBy: 'Current User'
      }

      this.projectService.update(updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isEditingProject = false
            this.loadProjects()
            this.loadProjectHierarchy(this.selectedProject!.id)
          },
          error: (error) => {
            console.error('Error updating project:', error)
          }
        })
    }
  }

  startEditComponent(): void {
    if (this.selectedComponent) {
      this.isEditingComponent = true
      this.componentForm.patchValue(this.selectedComponent)
    }
  }

  cancelEditComponent(): void {
    this.isEditingComponent = false
    this.componentForm.reset()
  }

  saveComponent(): void {
    if (this.componentForm.valid) {
      const formValue = this.componentForm.value
      
      if (this.selectedComponent) {
        // Update existing component
        const updateData: IProjectComponentPutDTO = {
          id: this.selectedComponent.id,
          idContext: formValue.idContext,
          idPlugin: formValue.idPlugin,
          name: formValue.name,
          description: formValue.description,
          subPackage: formValue.subPackage,
          updatedAt: this.selectedComponent.updatedAt,
          updatedBy: 'Current User'
        }

        this.projectComponentService.update(updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isEditingComponent = false
              this.loadProjectHierarchy(this.selectedProject!.id)
            },
            error: (error) => {
              console.error('Error updating component:', error)
            }
          })
      } else {
        // Create new component
        const createData: IProjectComponentPostDTO = {
          idProject: this.selectedProject!.id,
          idContext: formValue.idContext,
          idPlugin: formValue.idPlugin,
          name: formValue.name,
          description: formValue.description,
          subPackage: formValue.subPackage,
          createdBy: 'Current User'
        }

        this.projectComponentService.create(createData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isEditingComponent = false
              this.componentForm.reset()
              this.loadProjectHierarchy(this.selectedProject!.id)
            },
            error: (error) => {
              console.error('Error creating component:', error)
            }
          })
      }
    }
  }

  addNewComponent(): void {
    if (this.selectedProject) {
      this.selectedComponent = null
      this.isEditingComponent = true
      this.componentForm.reset()
      this.componentForm.patchValue({
        idProject: this.selectedProject.id,
        isActive: true
      })
    }
  }

  startEditProperty(): void {
    if (this.selectedProperty) {
      this.isEditingProperty = true
      this.propertyForm.patchValue(this.selectedProperty)
    }
  }

  cancelEditProperty(): void {
    this.isEditingProperty = false
    this.propertyForm.reset()
  }

  saveProperty(): void {
    if (this.propertyForm.valid) {
      const formValue = this.propertyForm.value
      
      if (this.selectedProperty) {
        // Update existing property
        const updateData: IProjectComponentPropertyPutDTO = {
          id: this.selectedProperty.id,
          sequence: formValue.sequence,
          dataObjectFilter: formValue.dataObjectFilter,
          propertyFilter: formValue.propertyFilter,
          updatedAt: this.selectedProperty.updatedAt,
          updatedBy: 'Current User'
        }

        this.projectComponentPropertyService.update(updateData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isEditingProperty = false
              this.loadProjectHierarchy(this.selectedProject!.id)
            },
            error: (error) => {
              console.error('Error updating property:', error)
            }
          })
      } else {
        // Create new property
        const createData: IProjectComponentPropertyPostDTO = {
          idProjectComponent: this.selectedComponent!.id,
          sequence: formValue.sequence,
          dataObjectFilter: formValue.dataObjectFilter,
          propertyFilter: formValue.propertyFilter,
          createdBy: 'Current User'
        }

        this.projectComponentPropertyService.create(createData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isEditingProperty = false
              this.propertyForm.reset()
              this.loadProjectHierarchy(this.selectedProject!.id)
            },
            error: (error) => {
              console.error('Error creating property:', error)
            }
          })
      }
    }
  }

  addNewProperty(): void {
    if (this.selectedComponent) {
      this.selectedProperty = null
      this.isEditingProperty = true
      this.propertyForm.reset()
      this.propertyForm.patchValue({
        idProjectComponent: this.selectedComponent.id,
        sequence: this.getNextSequence(),
        isActive: true
      })
    }
  }

  private getNextSequence(): number {
    if (!this.selectedComponent) return 1
    const component = this.selectedProjectHierarchy?.components.find(c => c.id === this.selectedComponent!.id)
    if (!component || !component.properties.length) return 1
    return Math.max(...component.properties.map(p => p.sequence)) + 1
  }

  closeSidenav(): void {
    this.detailsSidenav.close()
    this.selectedProject = null
    this.selectedComponent = null
    this.selectedProperty = null
    this.selectedProjectHierarchy = null
    this.isEditingProject = false
    this.isEditingComponent = false
    this.isEditingProperty = false
  }

  onPageChange(): void {
    this.loadProjects()
  }

  onSortChange(): void {
    this.loadProjects()
  }

  clearSearch(): void {
    this.searchForm.reset({
      searchColumn: 'name',
      searchValue: '',
      isActive: true
    })
  }

  createNewProject(): void {
    this.router.navigate(['/project/new'])
  }

  getSelectedComponentPropertiesCount(): number {
    if (!this.selectedComponent || !this.selectedProjectHierarchy) return 0
    const component = this.selectedProjectHierarchy.components.find(c => c.id === this.selectedComponent!.id)
    return component?.properties.length || 0
  }

  getSelectedComponentProperties(): IProjectComponentProperty[] {
    if (!this.selectedComponent || !this.selectedProjectHierarchy) return []
    const component = this.selectedProjectHierarchy.components.find(c => c.id === this.selectedComponent!.id)
    return component?.properties || []
  }
}
