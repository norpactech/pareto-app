/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface ISchemaDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface ISchemaPostDTO {
  idTenant: string
  name: string
  database: string
  description: string
  createdBy: string
}

export interface ISchemaPutDTO {
  id: string
  name: string
  database: string
  description: string
  updatedAt: Date
  updatedBy: string
}
