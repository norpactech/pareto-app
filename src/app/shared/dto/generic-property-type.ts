/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IGenericPropertyTypeDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IGenericPropertyTypePostDTO {
  idGenericDataType: string
  idValidation: string
  name: string
  description: string
  length: number
  scale: number
  isNullable: boolean
  defaultValue: string
  createdBy: string
}

export interface IGenericPropertyTypePutDTO {
  id: string
  idValidation: string
  name: string
  description: string
  length: number
  scale: number
  isNullable: boolean
  defaultValue: string
  updatedAt: Date
  updatedBy: string
}
