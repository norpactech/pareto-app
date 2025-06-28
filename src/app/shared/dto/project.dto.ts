/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IProjectDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IProjectPostDTO extends Record<string, unknown>  {
  idSchema: string
  name: string
  description: string
  domain: string
  artifact: string
  createdBy: string
}

export interface IProjectPutDTO extends Record<string, unknown>  {
  id: string
  name: string
  description: string
  domain: string
  artifact: string
  updatedAt: Date
  updatedBy: string
}
