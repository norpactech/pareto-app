/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IGenericDataTypeDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IGenericDataTypePostDTO {
  idTenant: string
  sequence: number
  name: string
  description: string
  alias: string
  createdBy: string
}

export interface IGenericDataTypePutDTO {
  id: string
  sequence: number
  name: string
  description: string
  alias: string
  updatedAt: Date
  updatedBy: string
}
