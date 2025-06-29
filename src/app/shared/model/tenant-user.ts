/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */

export interface ITenantUser extends Record<string, unknown> {
  idTenant: string
  tenantName: string
  idUser: string
  userEmail: string
}