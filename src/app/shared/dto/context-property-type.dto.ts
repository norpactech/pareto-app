/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IContextPropertyTypeDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IContextPropertyTypePostDTO extends Record<string, unknown>  {
  idContext: string
  idGenericPropertyType: string
  length: number
  scale: number
  isNullable: boolean
  defaultValue: string
  createdBy: string
}

export interface IContextPropertyTypePutDTO extends Record<string, unknown>  {
  id: string
  idGenericPropertyType: string
  length: number
  scale: number
  isNullable: boolean
  defaultValue: string
  updatedAt: Date
  updatedBy: string
}
