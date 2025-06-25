/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IProjectComponentProperty {
  id: string
  idProjectComponent: string
  projectComponentName: string
  sequence: number
  dataObjectFilter: string
  propertyFilter: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  isActive: boolean
}