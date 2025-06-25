/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IProjectComponentPropertyDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IProjectComponentPropertyPostDTO {
  idProjectComponent: string
  sequence: number
  dataObjectFilter: string
  propertyFilter: string
  createdBy: string
}

export interface IProjectComponentPropertyPutDTO {
  id: string
  sequence: number
  dataObjectFilter: string
  propertyFilter: string
  updatedAt: Date
  updatedBy: string
}
