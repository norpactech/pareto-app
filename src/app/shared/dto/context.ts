/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IContextDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IContextPostDTO {
  name: string
  description: string
  createdBy: string
}

export interface IContextPutDTO {
  id: string
  name: string
  description: string
  updatedAt: Date
  updatedBy: string
}
