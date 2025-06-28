/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */

export interface IGenericDataType extends Record<string, unknown> {
  id: string
  idTenant: string
  tenantName: string
  sequence: number
  name: string
  description: string
  alias: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  isActive: boolean
}