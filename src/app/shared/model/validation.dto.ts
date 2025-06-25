/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IValidation {
  id: string
  idTenant: string
  tenantName: string
  idRtValidationType: string
  name: string
  description: string
  errorMsg: string
  expression: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  isActive: boolean
}