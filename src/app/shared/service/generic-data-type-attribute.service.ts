/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
import { inject, Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { IGenericDataTypeAttribute } from '@shared/model'
import { EnvironmentService } from '@shared/service/environment.service';
import { BaseService } from '@shared/service/base.service';

@Injectable({
  providedIn: 'root',
})
export class GenericDataTypeAttributeService extends BaseService<IGenericDataTypeAttribute> {
  constructor() {
    const environmentService = inject(EnvironmentService);
    const snackBar = inject(MatSnackBar);
    super(environmentService.apiUrl + '/user', snackBar);
  }
}
