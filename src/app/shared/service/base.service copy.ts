/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { HttpClient } from '@angular/common/http'
import { inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ErrorDialogComponent } from '@shared/dialogs'
import { IApiResponse, IBaseEntity, IDeactReact, IPersistResponse } from '@shared/services/model'
import { TextUtils } from '@shared/utils'
import { Observable, throwError } from 'rxjs'
import { map } from 'rxjs/operators'

export abstract class BaseService<T extends IBaseEntity> {
  protected readonly httpClient = inject(HttpClient)
  protected readonly dialog = inject(MatDialog)

  constructor(
    private baseUrl: string,
    private snackBar: MatSnackBar
  ) { }

  public get(id: string): Observable<T | null> {
    if (!id) {
      return throwError(() => new Error('Context id is not set'))
    }

    return this.httpClient.get<IApiResponse<T>>(`${this.baseUrl}?id=${id}`).pipe(
      map((response) => {
        if (!response.data) {
          if (response.error) {
            this.handleError(response.error)
            throw new Error(JSON.stringify(response.error))
          }
          return null // Return null if no data is found
        }
        return response.data
      })
    )
  }

  public find(params: Record<string, unknown>): Observable<{ data: T[]; total: number }> {
    const queryParams: Record<string, string> = {}

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        switch (key) {
          case 'limit':
          case 'page':
            queryParams[key === 'page' ? 'offset' : key] = value.toString()
            break
          case 'sortColumn':
            queryParams['sortColumn'] = value === 'name' ? 'name' : value.toString()
            break
          case 'sortDirection':
            queryParams['sortDirection'] = value.toString()
            break
          case 'isActive':
            if (value === false) {
              queryParams['isActive'] = true.toString()
            }
            break
          default:
            queryParams[key] = value.toString()
        }
      }
    })
    if (params['searchColumn'] && params['searchValue']) {
      if (TextUtils.isUUID(params['searchValue'].toString())) {
        queryParams[params['searchColumn'].toString()] = params['searchValue'].toString()
      } else {
        queryParams[params['searchColumn'].toString()] =
          `*${params['searchValue'].toString()}*`
      }

      delete queryParams['searchColumn']
      delete queryParams['searchValue']
    }

    return this.httpClient
      .get<IApiResponse<T[]>>(`${this.baseUrl}/find`, { params: queryParams })
      .pipe(
        map((response) => ({
          data: response.data ?? [],
          total: response.meta?.count ?? 0,
        }))
      )
  }

  public isAvailable(id: string | null, name: string): Observable<boolean> {
    if (!name) {
      return throwError(() => new Error('Context name is not set'))    }

    const params: Record<string, string> = {
      name: `${name}`,
    }

    return this.httpClient
      .get<IApiResponse<T[]>>(`${this.baseUrl}/find`, { params })
      .pipe(
        map((response) => {
          const count = response.meta?.count ?? 0
          console.log('count', count)
          if (count === 0) {
            return true // Name is available
          }

          const data = response.data?.[0]
          console.log('data', JSON.stringify(data))
          if (data?.id === id) {
            return true // Name belongs to the same ID
          }
          return false // Name belongs to a different ID or is already taken
        })
      )
  }
  public persist(data: Partial<T>): Observable<IPersistResponse> {
    if (!data) {
      return throwError(() => new Error('Null or undefined context data'))
    }
    const params: Record<string, string> = {}
    let isUpdate = false

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = value instanceof Date ? value.toISOString() : value.toString()
        if (key === 'id' && value) {
          isUpdate = true
        }
      }
    })

    if (!isUpdate) {
      params['createdBy'] = 'Created By Change ME!'
    } else {
      params['updatedBy'] = 'Updated By Change ME!'
    }
    console.log(`${this.baseUrl}`)

    const request$ = isUpdate
      ? this.httpClient.put<IApiResponse<IPersistResponse>>(`${this.baseUrl}`, params)
      : this.httpClient.post<IApiResponse<IPersistResponse>>(`${this.baseUrl}`, params)

    return request$.pipe(
      map((response) => {
        if (!response.data) {
          if (response.error) {
            this.handleError(response.error)
            throw new Error(JSON.stringify(response.error))
          }
          throw new Error('No response data found')
        }        this.snackBar.open('Record Successfully Saved', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        })
        return response.data
      })
    )
  }

  public delete(data: Partial<T>): Observable<IPersistResponse> {
    if (!data) {
      return throwError(() => new Error('Null or undefined context data'))
    }    if (!data.id) {
      return throwError(() => new Error('ID is required for deletion'))
    }
    const id = data.id?.toString() // TypeScript now knows `id` exists
    const updatedBy = 'Deleted By Change ME!' // Default value for updatedBy

    const params: Record<string, string> = {
      id,
      updatedBy,
    }

    if (data.updatedAt) {
      params['updatedAt'] =
        data.updatedAt instanceof Date
          ? data.updatedAt.toISOString()
          : new Date(data.updatedAt as string).toISOString()
    }

    return this.httpClient
      .request<IApiResponse<IPersistResponse>>('DELETE', `${this.baseUrl}`, {
        body: params,
      })
      .pipe(
        map((response) => {
          if (!response.data) {
            if (response.error) {
              this.handleError(response.error)
              throw new Error(JSON.stringify(response.error))
            }
            throw new Error('No response data found')
          }          this.snackBar.open(`Record Successfully Deleted`, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          })
          return response.data
        })
      )
  }
  public deactReact(data: IDeactReact): Observable<IPersistResponse> {
    const { id, updatedAt, isActive } = data
    const action = isActive ? 'Reactivated' : 'Deactivated'
    const updatedBy = 'Change Me!'

    const params: Record<string, string> = {
      id,
      updatedAt:
        updatedAt instanceof Date
          ? updatedAt.toISOString()
          : new Date(updatedAt as string).toISOString(),
      updatedBy,
    }

    return this.httpClient
      .put<
        IApiResponse<IPersistResponse>
      >(`${this.baseUrl}/${isActive ? 'react' : 'deact'}`, params)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('No response data found')
          }          this.snackBar.open(`Record Successfully ${action}.`, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          })
          return response.data
        })
      )
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
