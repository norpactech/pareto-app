/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface ICardinalityDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface ICardinalityPostDTO extends Record<string, unknown>  {
  idProperty: string
  idObjectReference: string
  idRtCardinality: string
  idRtCardinalityStrength: string
  hasReferencialAction: boolean
  createdBy: string
}

export interface ICardinalityPutDTO extends Record<string, unknown>  {
  id: string
  idRtCardinality: string
  idRtCardinalityStrength: string
  hasReferencialAction: boolean
  updatedAt: Date
  updatedBy: string
}
