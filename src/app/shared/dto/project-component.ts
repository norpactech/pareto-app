/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IProjectComponentDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IProjectComponentPostDTO {
  idProject: string
  idContext: string
  idPlugin: string
  name: string
  description: string
  subPackage: string
  createdBy: string
}

export interface IProjectComponentPutDTO {
  id: string
  idContext: string
  idPlugin: string
  name: string
  description: string
  subPackage: string
  updatedAt: Date
  updatedBy: string
}
