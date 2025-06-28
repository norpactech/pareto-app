/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */

export interface IContextDataType extends Record<string, unknown> {
  id: string
  idContext: string
  contextName: string
  idGenericDataType: string
  genericDataTypeName: string
  sequence: number
  name: string
  description: string
  alias: string
  contextValue: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  isActive: boolean
}