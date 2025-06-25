/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { EnumStatus } from './enum-status'
import { IMeta } from './meta.dto'

export interface IApiResponse<T> {
  status: EnumStatus
  data: T | null
  error: T | null
  meta: IMeta
  detail: string
}
