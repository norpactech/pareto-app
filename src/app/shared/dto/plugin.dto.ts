/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IPluginDeleteDTO extends Record<string, unknown>  {
  id: string
  updatedAt: Date
  updatedBy: string
}

export interface IPluginPostDTO extends Record<string, unknown>  {
  idContext: string
  name: string
  description: string
  pluginService: string
  createdBy: string
}

export interface IPluginPutDTO extends Record<string, unknown>  {
  id: string
  name: string
  description: string
  pluginService: string
  updatedAt: Date
  updatedBy: string
}
