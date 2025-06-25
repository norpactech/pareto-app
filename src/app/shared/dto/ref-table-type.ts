/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IRefTableTypeDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IRefTableTypePostDTO {
  idTenant: string
  name: string
  description: string
  createdBy: string
}

export interface IRefTableTypePutDTO {
  id: string
  name: string
  description: string
  updatedAt: Date
  updatedBy: string
}
