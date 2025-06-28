/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */

export interface IUser extends Record<string, unknown> {
  id: string
  email: string
  idRtTimeZone: string
  zipCode: string
  phone: string
  lastName: string
  firstName: string
  city: string
  street1: string
  street2: string
  termsAccepted: Date
  state: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  isActive: boolean
}