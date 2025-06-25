/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface ITenantDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface ITenantPostDTO {
  name: string
  description: string
  copyright: string
  createdBy: string
}

export interface ITenantPutDTO {
  id: string
  name: string
  description: string
  copyright: string
  updatedAt: Date
  updatedBy: string
}
