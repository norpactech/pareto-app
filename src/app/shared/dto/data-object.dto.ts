/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IDataObjectDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IDataObjectPostDTO extends Record<string, unknown>  {
  idSchema: string
  name: string
  description: string
  hasIdentifier: boolean
  hasAudit: boolean
  hasActive: boolean
  createdBy: string
}

export interface IDataObjectPutDTO extends Record<string, unknown>  {
  id: string
  name: string
  description: string
  hasIdentifier: boolean
  hasAudit: boolean
  hasActive: boolean
  updatedAt: Date
  updatedBy: string
}
