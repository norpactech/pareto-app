/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IDataIndexPropertyDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IDataIndexPropertyPostDTO {
  idDataIndex: string
  idProperty: string
  idRtSortOrder: string
  sequence: number
  createdBy: string
}

export interface IDataIndexPropertyPutDTO {
  id: string
  idProperty: string
  idRtSortOrder: string
  sequence: number
  updatedAt: Date
  updatedBy: string
}
