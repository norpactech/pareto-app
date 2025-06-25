/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { inject, Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { IRefTableType } from '@shared/models'
import { BaseService, EnvironmentService } from '@shared/services';

@Injectable({
  providedIn: 'root',
})
export class RefTableTypeService extends BaseService<IRefTableType> {

  constructor() {
    const environmentService = inject(EnvironmentService);
    const snackBar = inject(MatSnackBar);
    super(environmentService.apiUrl + '/ref-table-type', snackBar);
  }
}