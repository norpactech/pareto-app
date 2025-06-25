/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

import { Injectable, inject } from '@angular/core'
import { RefTablesService, RefTableTypeService } from '@shared/services'
import { Observable, throwError } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'

// Define the interfaces locally since they don't exist in the current models
interface IRefTableType {
  id: string
  name: string
}

interface IRefTables {
  id: string
  name: string
  value: string
}

@Injectable({
  providedIn: 'root',
})
export class TableUtils {
  private refTableTypeService = inject(RefTableTypeService);
  private refTablesService = inject(RefTablesService);
  /**
   * Finds and maps RefTables by RefTableType name.
   * @param refTableTypeName The name of the RefTableType to search for.
   * @returns Observable of id/name list.
   */
  findRefTable(refTableTypeName: string): Observable<{ id: string; name: string }[]> {
    const params = {
      searchColumn: 'name',
      searchValue: refTableTypeName,
    }
    return this.refTableTypeService.find(params).pipe(
      map((response) => response.data?.[0] as IRefTableType | null),
      switchMap((refTableType) => {
        if (!refTableType) {
          return throwError(() => new Error('No RefTableType found'))
        }
        const tableParams = {
          sortColumn: 'name',
          sortDirection: 'asc',
          searchColumn: 'idRefTableType',
          searchValue: refTableType.id,
        }
        return this.refTablesService.find(tableParams).pipe(
          map((response) =>
            response.data.map((type: IRefTables) => ({
              id: type.id,
              name: type.name,
            }))
          )
        )
      }),
      catchError((err) => {
        console.error('Error fetching attribute data types:', err)
        return throwError(() => err)
      })
    )
  }
}
