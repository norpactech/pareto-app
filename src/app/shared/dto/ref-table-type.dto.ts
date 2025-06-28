/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IRefTableTypeDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IRefTableTypePostDTO extends Record<string, unknown>  {
  idTenant: string
  name: string
  description: string
  createdBy: string
}

export interface IRefTableTypePutDTO extends Record<string, unknown>  {
  id: string
  name: string
  description: string
  updatedAt: Date
  updatedBy: string
}
