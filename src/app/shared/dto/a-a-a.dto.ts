/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IAAADeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IAAAPostDTO extends Record<string, unknown>  {
  createdBy: string
}

export interface IAAAPutDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}
