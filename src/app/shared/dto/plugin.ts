/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IPluginDeleteDTO {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IPluginPostDTO {
  idContext: string
  name: string
  description: string
  pluginService: string
  createdBy: string
}

export interface IPluginPutDTO {
  id: string
  name: string
  description: string
  pluginService: string
  updatedAt: Date
  updatedBy: string
}
