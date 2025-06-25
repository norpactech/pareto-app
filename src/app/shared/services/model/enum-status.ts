/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

export enum EnumStatus {
  OK = 'OK',
  ERROR = 'ERROR',
}

export class EnumStatusHelper {
  static fromName(name: string): EnumStatus | null {
    for (const status of Object.values(EnumStatus)) {
      if (status === name) {
        return status as EnumStatus
      }
    }
    return null
  }
}
