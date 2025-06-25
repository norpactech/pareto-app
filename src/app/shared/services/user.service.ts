/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { inject, Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { IUser } from '@shared/models'
import { BaseService, EnvironmentService } from '@shared/services';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService<IUser> {

  constructor() {
    const environmentService = inject(EnvironmentService);
    const snackBar = inject(MatSnackBar);
    super(environmentService.apiUrl + '/user', snackBar);
  }
}
