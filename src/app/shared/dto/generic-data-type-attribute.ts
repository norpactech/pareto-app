/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IGenericDataTypeAttributeDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IGenericDataTypeAttributePostDTO {
  idGenericDataType: string
  idRtAttrDataType: string
  name: string
  description: string
  createdBy: string
}

export interface IGenericDataTypeAttributePutDTO {
  id: string
  idRtAttrDataType: string
  name: string
  description: string
  updatedAt: Date
  updatedBy: string
}
