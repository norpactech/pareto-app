/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */
import { Injectable } from '@angular/core'
import { BehaviorSubject, Subject } from 'rxjs'
import { IDataObject } from '@shared/model'

export interface DataObjectChangeEvent {
  type: 'created' | 'updated' | 'deleted' | 'status-changed' | 'refresh'
  dataObject: IDataObject
  schemaId: string
}

@Injectable({
  providedIn: 'root'
})
export class DataObjectStateService {
  private readonly dataObjectsSubject = new BehaviorSubject<IDataObject[]>([])
  private readonly changeEventSubject = new Subject<DataObjectChangeEvent>()
  
  /**
   * Observable for the current data objects list
   */
  public readonly dataObjects$ = this.dataObjectsSubject.asObservable()
  
  /**
   * Observable for data object change events
   */
  public readonly changeEvents$ = this.changeEventSubject.asObservable()

  /**
   * Get the current data objects
   */
  get currentDataObjects(): IDataObject[] {
    return this.dataObjectsSubject.value
  }

  /**
   * Set the data objects list
   */
  setDataObjects(dataObjects: IDataObject[]): void {
    console.log('DataObjectStateService: Setting data objects:', dataObjects)
    this.dataObjectsSubject.next(dataObjects)
  }

  /**
   * Add a new data object to the list
   */
  addDataObject(dataObject: IDataObject): void {
    const currentObjects = this.currentDataObjects
    const updatedObjects = [...currentObjects, dataObject]
    this.setDataObjects(updatedObjects)
    
    this.emitChangeEvent({
      type: 'created',
      dataObject,
      schemaId: dataObject.idSchema
    })
  }

  /**
   * Update an existing data object in the list
   */
  updateDataObject(updatedDataObject: IDataObject): void {
    const currentObjects = this.currentDataObjects
    const index = currentObjects.findIndex(obj => obj.id === updatedDataObject.id)
    
    if (index !== -1) {
      const updatedObjects = [...currentObjects]
      updatedObjects[index] = updatedDataObject
      this.setDataObjects(updatedObjects)
      
      this.emitChangeEvent({
        type: 'updated',
        dataObject: updatedDataObject,
        schemaId: updatedDataObject.idSchema
      })
    }
  }

  /**
   * Remove a data object from the list
   */
  removeDataObject(dataObjectId: string): void {
    const currentObjects = this.currentDataObjects
    const dataObject = currentObjects.find(obj => obj.id === dataObjectId)
    
    if (dataObject) {
      const updatedObjects = currentObjects.filter(obj => obj.id !== dataObjectId)
      this.setDataObjects(updatedObjects)
      
      this.emitChangeEvent({
        type: 'deleted',
        dataObject,
        schemaId: dataObject.idSchema
      })
    }
  }

  /**
   * Update data object status (active/inactive)
   */
  updateDataObjectStatus(dataObjectId: string, isActive: boolean): void {
    const currentObjects = this.currentDataObjects
    const index = currentObjects.findIndex(obj => obj.id === dataObjectId)
    
    if (index !== -1) {
      const updatedObjects = [...currentObjects]
      updatedObjects[index] = { ...updatedObjects[index], isActive }
      this.setDataObjects(updatedObjects)
      
      this.emitChangeEvent({
        type: 'status-changed',
        dataObject: updatedObjects[index],
        schemaId: updatedObjects[index].idSchema
      })
    }
  }

  /**
   * Clear all data objects (when schema changes)
   */
  clearDataObjects(): void {
    console.log('DataObjectStateService: Clearing data objects')
    this.setDataObjects([])
  }

  /**
   * Emit a change event
   */
  private emitChangeEvent(event: DataObjectChangeEvent): void {
    console.log('DataObjectStateService: Emitting change event:', event)
    this.changeEventSubject.next(event)
  }

  /**
   * Refresh data objects for a specific schema
   */
  refreshForSchema(schemaId: string): void {
    console.log('DataObjectStateService: Requesting refresh for schema:', schemaId)
    // This will trigger a reload in components that listen to this event
    this.changeEventSubject.next({
      type: 'refresh',
      dataObject: {} as IDataObject,
      schemaId
    })
  }
}
