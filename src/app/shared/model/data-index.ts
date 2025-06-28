/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */

export interface IDataIndex extends Record<string, unknown> {
  id: string
  idDataObject: string
  dataObjectName: string
  idRtIndexType: string
  name: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  isActive: boolean
}