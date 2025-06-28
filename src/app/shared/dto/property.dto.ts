/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IPropertyDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IPropertyPostDTO extends Record<string, unknown>  {
  idDataObject: string
  idGenericDataType: string
  idGenericPropertyType: string
  idValidation: string
  sequence: number
  name: string
  description: string
  isUpdatable: boolean
  fkViewable: boolean
  length: number
  scale: number
  isNullable: boolean
  defaultValue: string
  createdBy: string
}

export interface IPropertyPutDTO extends Record<string, unknown>  {
  id: string
  idGenericDataType: string
  idGenericPropertyType: string
  idValidation: string
  sequence: number
  name: string
  description: string
  isUpdatable: boolean
  fkViewable: boolean
  length: number
  scale: number
  isNullable: boolean
  defaultValue: string
  updatedAt: Date
  updatedBy: string
}
