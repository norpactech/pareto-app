/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IDataIndexDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IDataIndexPostDTO extends Record<string, unknown>  {
  idDataObject: string
  idRtIndexType: string
  name: string
  createdBy: string
}

export interface IDataIndexPutDTO extends Record<string, unknown>  {
  id: string
  idRtIndexType: string
  name: string
  updatedAt: Date
  updatedBy: string
}
