/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IUserDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IUserPostDTO {
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
  createdBy: string
}

export interface IUserPutDTO {
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
  updatedAt: Date
  updatedBy: string
}
