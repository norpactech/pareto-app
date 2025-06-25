/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IGenericPropertyType {
  id: string
  idGenericDataType: string
  genericDataTypeName: string
  idValidation: string
  validationName: string
  name: string
  description: string
  length: number
  scale: number
  isNullable: boolean
  defaultValue: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  isActive: boolean
}