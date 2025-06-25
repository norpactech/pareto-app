/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IRefTablesDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IRefTablesPostDTO {
  idRefTableType: string
  name: string
  description: string
  value: string
  sequence: number
  createdBy: string
}

export interface IRefTablesPutDTO {
  id: string
  name: string
  description: string
  value: string
  sequence: number
  updatedAt: Date
  updatedBy: string
}
