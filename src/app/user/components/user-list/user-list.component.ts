/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.dto';
import { UserProfileComponent } from '../user-profile/user-profile.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  users: User[] = [];
  isLoading = false;
  displayedColumns: string[] = ['name', 'email', 'phone', 'lastUpdated', 'actions'];
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private loadUsers(): void {
    this.isLoading = true;
    this.userService.find({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: { data: User[]; total: number }) => {
          this.users = result.data;
          this.isLoading = false;
        },
        error: (error: unknown) => {
          console.error('Error loading users:', error);
          this.showError('Failed to load users');
          this.isLoading = false;
        }
      });
  }

  openUserProfile(user?: User): void {
    const dialogRef = this.dialog.open(UserProfileComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      data: user || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Refresh the list
        this.showSuccess(user ? 'User updated successfully' : 'User created successfully');
      }
    });
  }
  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.userService.delete({ id: user.id })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsers(); // Refresh the list
            this.showSuccess('User deleted successfully');
          },
          error: (error: unknown) => {
            console.error('Error deleting user:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
            this.showError(errorMessage);
          }
        });
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }
}
