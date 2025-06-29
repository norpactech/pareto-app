/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatChipsModule } from '@angular/material/chips'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { ProjectService } from '@shared/service/project.service'
import { IProject } from '@shared/model'

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private destroy$ = new Subject<void>()

  project: IProject | null = null
  loading = false
  projectId: string | null = null

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.projectId = params.get('id')
        if (this.projectId) {
          this.loadProject(this.projectId)
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private loadProject(id: string): void {
    this.loading = true
    
    this.projectService.get(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project) => {
          this.project = project
          this.loading = false
        },
        error: (error) => {
          console.error('Error loading project:', error)
          this.loading = false
          this.router.navigate(['/project'])
        }
      })
  }

  editProject(): void {
    if (this.projectId) {
      this.router.navigate(['/project', this.projectId, 'edit'])
    }
  }

  goBack(): void {
    this.router.navigate(['/project'])
  }

  toggleProjectStatus(): void {
    if (!this.project) return

    const deactReactData = {
      id: this.project.id,
      updatedAt: this.project.updatedAt,
      isActive: !this.project.isActive
    }

    this.projectService.deactReact(deactReactData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.projectId) {
            this.loadProject(this.projectId)
          }
        },
        error: (error) => {
          console.error('Error updating project status:', error)
        }
      })
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}
