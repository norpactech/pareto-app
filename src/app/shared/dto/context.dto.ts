/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IContextDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IContextPostDTO extends Record<string, unknown>  {
  name: string
  description: string
  createdBy: string
}

export interface IContextPutDTO extends Record<string, unknown>  {
  id: string
  name: string
  description: string
  updatedAt: Date
  updatedBy: string
}
