/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface ITenantDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface ITenantPostDTO extends Record<string, unknown>  {
  name: string
  description: string
  copyright: string
  timeZone: string
  createdBy: string
}

export interface ITenantPutDTO extends Record<string, unknown>  {
  id: string
  name: string
  description: string
  copyright: string
  timeZone: string
  updatedAt: Date
  updatedBy: string
}
