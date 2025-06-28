/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IRefTablesDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IRefTablesPostDTO extends Record<string, unknown>  {
  idRefTableType: string
  name: string
  description: string
  value: string
  sequence: number
  createdBy: string
}

export interface IRefTablesPutDTO extends Record<string, unknown>  {
  id: string
  name: string
  description: string
  value: string
  sequence: number
  updatedAt: Date
  updatedBy: string
}
