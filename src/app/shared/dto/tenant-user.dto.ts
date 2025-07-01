/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface ITenantUserDeleteDTO extends Record<string, unknown>  {
  idTenant: string
  idUser: string
}

export interface ITenantUserPostDTO extends Record<string, unknown>  {
  idTenant: string
  idUser: string
}

export interface ITenantUserPutDTO extends Record<string, unknown>  {
  idTenant: string
  idUser: string
}

