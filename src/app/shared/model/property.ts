/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */

export interface IProperty extends Record<string, unknown> {
  id: string
  idDataObject: string
  dataObjectName: string
  idGenericDataType: string
  genericDataTypeName: string
  idGenericPropertyType: string
  genericPropertyTypeName: string
  idValidation: string
  validationName: string
  sequence: number
  name: string
  description: string
  isUpdatable: boolean
  fkViewable: boolean
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