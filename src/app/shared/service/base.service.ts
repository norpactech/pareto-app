import { inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ErrorDialogComponent } from '@shared/dialogs'

export class BaseService {

  protected readonly dialog = inject(MatDialog)

  protected getRequestData(data: Record<string, unknown>): Record<string, string> {

    const requestBody: Record<string, string> = {}

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'updatedAt') {
          requestBody[key] = value instanceof Date ? value.toISOString() : new Date(value as string).toISOString()
        } else if (key === 'updatedBy') {
          requestBody[key] = "Change Me in requestData!"
        } else if (value instanceof Date) {
          requestBody[key] = value.toISOString()
        } else if (typeof value === 'boolean') {
          requestBody[key] = value.toString()
        } else if (typeof value === 'number') {
          requestBody[key] = value.toString()
        } else {
          requestBody[key] = value.toString()
        }
      }
    })
    return requestBody
  }

  protected handleError(error: unknown): void {
    let errorMessage: string

    if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error, null, 2)
    } else {
      errorMessage = (error as string) || 'An unexpected error occurred.'
    }

    this.dialog.open(ErrorDialogComponent, {
      width: '400px',
      data: { message: errorMessage },
    })
  }
}