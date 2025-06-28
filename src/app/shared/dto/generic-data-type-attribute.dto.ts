/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IGenericDataTypeAttributeDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IGenericDataTypeAttributePostDTO extends Record<string, unknown>  {
  idGenericDataType: string
  idRtAttrDataType: string
  name: string
  description: string
  createdBy: string
}

export interface IGenericDataTypeAttributePutDTO extends Record<string, unknown>  {
  id: string
  idRtAttrDataType: string
  name: string
  description: string
  updatedAt: Date
  updatedBy: string
}
