/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IUserDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IUserPostDTO extends Record<string, unknown>  {
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
  createdBy: string
}

export interface IUserPutDTO extends Record<string, unknown>  {
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
  updatedAt: Date
  updatedBy: string
}
