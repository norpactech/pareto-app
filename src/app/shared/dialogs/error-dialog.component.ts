/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button' // Import MatButtonModule
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatDialogModule } from '@angular/material/dialog' // Import MatDialogModule

@Component({
  selector: 'app-error-dialog',
  template: `
    <h1 mat-dialog-title>Server Error</h1>
    <div mat-dialog-content>
      <p class="mono-font">
        {{ data.message }}
      </p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onClose()">Close</button>
    </div>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  styles: [
    `
      .mono-font {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        color: #000;
      }
    `,
  ],
})
export class ErrorDialogComponent {
  public dialogRef = inject(MatDialogRef<ErrorDialogComponent>);
  public data: { message: string } = inject(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close()
  }
}
