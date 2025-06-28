/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IDataIndexPropertyDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IDataIndexPropertyPostDTO extends Record<string, unknown>  {
  idDataIndex: string
  idProperty: string
  idRtSortOrder: string
  sequence: number
  createdBy: string
}

export interface IDataIndexPropertyPutDTO extends Record<string, unknown>  {
  id: string
  idProperty: string
  idRtSortOrder: string
  sequence: number
  updatedAt: Date
  updatedBy: string
}
