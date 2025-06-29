/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { EnvironmentService } from '@shared/service/environment.service'
import { IApiResponse, IDeactReact, IPersistResponse } from '@shared/service/model'
import { TextUtils } from '@shared/utils'
import { Observable, throwError } from 'rxjs'
import { map } from 'rxjs/operators'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BaseService } from './base.service'

import { IProjectComponent } from '@shared/model'
import { IProjectComponentPostDTO, IProjectComponentPutDTO, IProjectComponentDeleteDTO } from '@shared/dto'

@Injectable({
  providedIn: 'root',
})
export class ProjectComponentService extends BaseService {

  protected readonly httpClient = inject(HttpClient)
  protected readonly snackBar = inject(MatSnackBar)
  protected readonly environmentService = inject(EnvironmentService)
  protected readonly baseUrl = this.environmentService.apiUrl + '/project-component'

  public get(id: string): Observable<IProjectComponent | null> {

    // TODO: Input Validation on the Primary Key - Singular or Compound

    return this.httpClient.get<IApiResponse<IProjectComponent>>(`${this.baseUrl}?id=${id}`).pipe(
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

  public find(params: Record<string, unknown>): Observable<{ data: IProjectComponent[]; total: number }> {
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
      .get<IApiResponse<IProjectComponent[]>>(`${this.baseUrl}/find`, { params: queryParams })
      .pipe(
        map((response) => ({
          data: response.data ?? [],
          total: response.meta?.count ?? 0,
        }))
      )
  }

  public create(data: IProjectComponentPostDTO): Observable<IPersistResponse> {
    if (!data) {
      return throwError(() => new Error('Null or undefined data'))
    }
    const requestBody: Record<string, string> = this.getRequestData(data)

    return this.httpClient
      .request<IApiResponse<IPersistResponse>>('POST', `${this.baseUrl}`, {
        body: requestBody,
      })
      .pipe(
        map((response) => {
          if (!response.data) {
            if (response.error) {
              this.handleError(response.error)
              throw new Error(JSON.stringify(response.error))
            }
            throw new Error('No response data found')
          }
          this.snackBar.open(`Record Successfully Created`, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          })
          return response.data
        })
      )
  }  

  public update(data: IProjectComponentPutDTO): Observable<IPersistResponse> {
    if (!data) {
      return throwError(() => new Error('Null or undefined data'))
    }
    const requestBody: Record<string, string> = this.getRequestData(data)

    return this.httpClient
      .request<IApiResponse<IPersistResponse>>('POST', `${this.baseUrl}`, {
        body: requestBody,
      })
      .pipe(
        map((response) => {
          if (!response.data) {
            if (response.error) {
              this.handleError(response.error)
              throw new Error(JSON.stringify(response.error))
            }
            throw new Error('No response data found')
          }
          this.snackBar.open(`Record Successfully Updated`, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
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
          : new Date(updatedAt as string).toISOString(),  // Placeholder only
      updatedBy,
    }

    return this.httpClient
      .put<IApiResponse<IPersistResponse>>(`${this.baseUrl}/${isActive ? 'react' : 'deact'}`, params)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('No response data found')
          }
          this.snackBar.open(`Record Successfully ${action}.`, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          })
          return response.data
        })
      )
  }

  public delete(data: IProjectComponentDeleteDTO): Observable<IPersistResponse> {
    if (!data) {
      return throwError(() => new Error('Null or undefined data'))
    }
    const requestBody: Record<string, string> = this.getRequestData(data)

    return this.httpClient
      .request<IApiResponse<IPersistResponse>>('DELETE', `${this.baseUrl}`, {
        body: requestBody,
      })
      .pipe(
        map((response) => {
          if (!response.data) {
            if (response.error) {
              this.handleError(response.error)
              throw new Error(JSON.stringify(response.error))
            }
            throw new Error('No response data found')
          }
          this.snackBar.open(`Record Successfully Deleted`, 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          })
          return response.data
        })
      )
  }
}
