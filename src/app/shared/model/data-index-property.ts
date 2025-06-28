/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */

export interface IDataIndexProperty extends Record<string, unknown> {
  id: string
  idDataIndex: string
  dataIndexName: string
  idProperty: string
  propertyName: string
  idRtSortOrder: string
  sequence: number
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  isActive: boolean
}