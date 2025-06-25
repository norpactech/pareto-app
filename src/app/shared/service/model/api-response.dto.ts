import { EnumStatus } from './enum-status'
import { IMeta } from './meta.dto'

export interface IApiResponse<T> {
  status: EnumStatus
  data: T | null
  error: T | null
  meta: IMeta
  detail: string
}
