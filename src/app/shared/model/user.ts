/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */

export interface IUser extends Record<string, unknown> {
  id: string
  email: string
  lastName: string
  firstName: string
  phone: string
  street1: string
  street2: string
  city: string
  state: string
  zipCode: string
  termsAccepted: Date
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  isActive: boolean
}