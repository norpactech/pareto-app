/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IGenericPropertyTypeDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IGenericPropertyTypePostDTO extends Record<string, unknown>  {
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

export interface IGenericPropertyTypePutDTO extends Record<string, unknown>  {
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
