/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
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
import { Subject } from 'rxjs'
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators'

import { ProjectService } from '@shared/service/project.service'
import { IProject } from '@shared/model'

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
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
    MatCheckboxModule
  ],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService)
  private router = inject(Router)
  private fb = inject(FormBuilder)
  private destroy$ = new Subject<void>()

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  displayedColumns: string[] = ['name', 'description', 'domain', 'artifact', 'isActive', 'actions']
  dataSource = new MatTableDataSource<IProject>()
  totalItems = 0
  loading = false
  
  searchForm: FormGroup
  
  searchColumns = [
    { value: 'name', label: 'Name' },
    { value: 'description', label: 'Description' },
    { value: 'domain', label: 'Domain' },
    { value: 'artifact', label: 'Artifact' }
  ]

  constructor() {
    this.searchForm = this.fb.group({
      searchColumn: ['name'],
      searchValue: [''],
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
          this.dataSource.data = response.data
          this.totalItems = response.total
          this.loading = false
        },
        error: (error) => {
          console.error('Error loading projects:', error)
          this.loading = false
        }
      })
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

  viewProject(project: IProject): void {
    this.router.navigate(['/project', project.id])
  }

  editProject(project: IProject): void {
    this.router.navigate(['/project', project.id, 'edit'])
  }

  createProject(): void {
    this.router.navigate(['/project/new'])
  }

  toggleProjectStatus(project: IProject): void {
    const deactReactData = {
      id: project.id,
      updatedAt: project.updatedAt,
      isActive: !project.isActive
    }

    this.projectService.deactReact(deactReactData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadProjects()
        },
        error: (error) => {
          console.error('Error updating project status:', error)
        }
      })
  }
}
