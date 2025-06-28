/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IProjectComponentPropertyDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IProjectComponentPropertyPostDTO extends Record<string, unknown>  {
  idProjectComponent: string
  sequence: number
  dataObjectFilter: string
  propertyFilter: string
  createdBy: string
}

export interface IProjectComponentPropertyPutDTO extends Record<string, unknown>  {
  id: string
  sequence: number
  dataObjectFilter: string
  propertyFilter: string
  updatedAt: Date
  updatedBy: string
}
