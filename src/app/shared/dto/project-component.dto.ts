/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IProjectComponentDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IProjectComponentPostDTO extends Record<string, unknown>  {
  idProject: string
  idContext: string
  idPlugin: string
  name: string
  description: string
  subPackage: string
  createdBy: string
}

export interface IProjectComponentPutDTO extends Record<string, unknown>  {
  id: string
  idContext: string
  idPlugin: string
  name: string
  description: string
  subPackage: string
  updatedAt: Date
  updatedBy: string
}
