/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IValidationDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IValidationPostDTO extends Record<string, unknown>  {
  idTenant: string
  idRtValidationType: string
  name: string
  description: string
  errorMsg: string
  expression: string
  createdBy: string
}

export interface IValidationPutDTO extends Record<string, unknown>  {
  id: string
  idRtValidationType: string
  name: string
  description: string
  errorMsg: string
  expression: string
  updatedAt: Date
  updatedBy: string
}
