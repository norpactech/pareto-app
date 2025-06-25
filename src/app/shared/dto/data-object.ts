/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IDataObjectDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IDataObjectPostDTO {
  idSchema: string
  name: string
  description: string
  hasIdentifier: boolean
  hasAudit: boolean
  hasActive: boolean
  createdBy: string
}

export interface IDataObjectPutDTO {
  id: string
  name: string
  description: string
  hasIdentifier: boolean
  hasAudit: boolean
  hasActive: boolean
  updatedAt: Date
  updatedBy: string
}
