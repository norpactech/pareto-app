/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IProjectDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IProjectPostDTO {
  idSchema: string
  name: string
  description: string
  domain: string
  artifact: string
  createdBy: string
}

export interface IProjectPutDTO {
  id: string
  name: string
  description: string
  domain: string
  artifact: string
  updatedAt: Date
  updatedBy: string
}
