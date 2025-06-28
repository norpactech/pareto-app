/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IContextDataTypeDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IContextDataTypePostDTO extends Record<string, unknown>  {
  idContext: string
  idGenericDataType: string
  sequence: number
  name: string
  description: string
  alias: string
  contextValue: string
  createdBy: string
}

export interface IContextDataTypePutDTO extends Record<string, unknown>  {
  id: string
  idGenericDataType: string
  sequence: number
  name: string
  description: string
  alias: string
  contextValue: string
  updatedAt: Date
  updatedBy: string
}
