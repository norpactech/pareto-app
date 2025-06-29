/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { EnvironmentService } from '@shared/service/environment.service';
import { IApiResponse, IPersistResponse } from '@shared/service/model'
import { TextUtils } from '@shared/utils'
import { Observable, throwError } from 'rxjs'
import { map } from 'rxjs/operators'
import { MatSnackBar } from '@angular/material/snack-bar'
import { BaseService } from './base.service';

import { ITenantUser } from '@shared/model'
import { ITenantUserPostDTO, ITenantUserDeleteDTO } from '@shared/dto'

@Injectable({
  providedIn: 'root',
})
export class TenantUserService extends BaseService {

  protected readonly httpClient = inject(HttpClient)
  protected readonly snackBar = inject(MatSnackBar)
  protected readonly environmentService = inject(EnvironmentService);
  protected readonly baseUrl = this.environmentService.apiUrl + '/tenant-user';

  public get(id_tenant: string, id_user: string): Observable<ITenantUser | null> {

    // TODO: Input Validation on the Primary Key - Singular or Compound

    return this.httpClient.get<IApiResponse<ITenantUser>>(`${this.baseUrl}?id_tenant=${id_tenant}&id_user=${id_user}`).pipe(
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

  public find(params: Record<string, unknown>): Observable<{ data: ITenantUser[]; total: number }> {
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
      .get<IApiResponse<ITenantUser[]>>(`${this.baseUrl}/find`, { params: queryParams })
      .pipe(
        map((response) => ({
          data: response.data ?? [],
          total: response.meta?.count ?? 0,
        }))
      )
  }

  public create(data: ITenantUserPostDTO): Observable<IPersistResponse> {
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

  public delete(data: ITenantUserDeleteDTO): Observable<IPersistResponse> {
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
