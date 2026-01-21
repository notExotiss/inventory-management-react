"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Container, Item } from './types'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

interface InventoryState {
  containers: Container[]
  selectedContainer: string | null
  selectedItems: Set<string>
  searchQuery: string
  expandedContainers: Set<string>
}

const mockContainers: Container[] = [
  {
    id: 'trailers',
    containerName: 'Trailers',
    containerLocation: { path: '/Trailers' },
    items: [],
    isExpanded: false,
    children: []
  },
  {
    id: 'rooms',
    containerName: 'Rooms',
    containerLocation: { path: '/Rooms' },
    items: [],
    isExpanded: true,
    children: [
      {
        id: 'av-room',
        containerName: 'AV Room',
        containerLocation: { path: '/Rooms/AV_Room' },
        items: [],
        parentId: 'rooms'
      },
      {
        id: 'mays-room',
        containerName: "May's Room",
        containerLocation: { path: '/Rooms/Mays_Room' },
        items: [],
        parentId: 'rooms'
      },
      {
        id: 'kearnys-room',
        containerName: "Kearny's Room",
        containerLocation: { path: '/Rooms/Kearnys_Room' },
        items: [],
        isExpanded: true,
        parentId: 'rooms',
        children: [
          {
            id: 'kearnys-desk',
            containerName: "Kearny's Desk",
            containerLocation: { path: '/Rooms/Kearnys_Room/Kearnys_Desk' },
            items: [],
            parentId: 'kearnys-room'
          },
          {
            id: 'back-corner-shelf',
            containerName: "Back Corner Shelf",
            containerLocation: { path: '/Rooms/Kearnys_Room/Back_Corner_Shelf' },
            items: [],
            parentId: 'kearnys-room'
          },
          {
            id: 'big-cabinet',
            containerName: "Big Cabinet",
            containerLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet' },
            items: [],
            isExpanded: true,
            parentId: 'kearnys-room',
            children: [
              {
                id: 'box-1',
                containerName: "Box 1",
                containerLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_1' },
                items: [
                  {
                    id: 'wire-1',
                    itemName: '22 AWG Wire',
                    itemLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_1' },
                    itemMeasurements: { unit: 'ft', size: 2 },
                    description: 'Thin wire for electronics'
                  },
                  {
                    id: 'wire-2',
                    itemName: '22 AWG Wire',
                    itemLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_1' },
                    itemMeasurements: { unit: 'ft', size: 5 },
                    description: 'Thin wire, color: red'
                  },
                  {
                    id: 'resistor-1',
                    itemName: '10k Resistor',
                    itemLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_1' },
                    itemMeasurements: { unit: 'pcs', size: 10 },
                    description: 'Through-hole resistors'
                  },
                  {
                    id: 'capacitor-1',
                    itemName: '100uF Capacitor',
                    itemLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_1' },
                    itemMeasurements: { unit: 'pcs', size: 5 },
                    description: 'Electrolytic capacitors'
                  },
                  {
                    id: 'arduino-1',
                    itemName: 'Arduino Uno',
                    itemLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_1' },
                    itemMeasurements: { unit: 'pcs', size: 1 },
                    description: 'Microcontroller board'
                  }
                ],
                parentId: 'big-cabinet'
              },
              {
                id: 'box-2',
                containerName: "Box 2",
                containerLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_2' },
                items: [],
                parentId: 'big-cabinet'
              },
              {
                id: 'box-3',
                containerName: "Box 3",
                containerLocation: { path: '/Rooms/Kearnys_Room/Big_Cabinet/Box_3' },
                items: [],
                parentId: 'big-cabinet'
              }
            ]
          },
          {
            id: 'small-cabinet',
            containerName: "Small Cabinet",
            containerLocation: { path: '/Rooms/Kearnys_Room/Small_Cabinet' },
            items: [],
            parentId: 'kearnys-room'
          }
        ]
      }
    ]
  }
]

const initialState: InventoryState = {
  containers: mockContainers,
  selectedContainer: 'box-1',
  selectedItems: new Set(),
  searchQuery: '',
  expandedContainers: new Set(['trailers', 'rooms', 'av-room', 'mays-room', 'kearnys-room', 'kearnys-desk', 'back-corner-shelf', 'big-cabinet', 'box-1', 'box-2', 'box-3', 'small-cabinet'])
}

// Helper functions
function findContainerById(containers: Container[], id: string): Container | null {
  for (const container of containers) {
    if (container.id === id) {
      return container
    }

    if (container.children && container.children.length > 0) {
      const found = findContainerById(container.children, id)
      if (found) return found
    }
  }

  return null
}

function updateContainerInTree(containers: Container[], updatedContainer: Container): Container[] {
  return containers.map(container => {
    if (container.id === updatedContainer.id) {
      return updatedContainer
    } else if (container.children && container.children.length > 0) {
      return {
        ...container,
        children: updateContainerInTree(container.children, updatedContainer)
      }
    }
    return container
  })
}

function toggleContainerExpansion(containers: Container[], id: string): Container[] {
  return containers.map(container => {
    if (container.id === id) {
      return { ...container, isExpanded: !container.isExpanded }
    } else if (container.children && container.children.length > 0) {
      return { ...container, children: toggleContainerExpansion(container.children, id) }
    }
    return container
  })
}

function addItemToContainer(containers: Container[], containerId: string, item: Item): Container[] {
  return containers.map(container => {
    if (container.id === containerId) {
      return {
        ...container,
        items: [...(container.items || []), item]
      }
    } else if (container.children && container.children.length > 0) {
      return {
        ...container,
        children: addItemToContainer(container.children, containerId, item)
      }
    }
    return container
  })
}

function updateItemInContainers(containers: Container[], updatedItem: Item): Container[] {
  return containers.map(container => {
    if (container.items) {
      const updatedItems = container.items.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
      return { ...container, items: updatedItems }
    } else if (container.children && container.children.length > 0) {
      return {
        ...container,
        children: updateItemInContainers(container.children, updatedItem)
      }
    }
    return container
  })
}

function deleteItemsFromContainers(containers: Container[], itemIds: string[]): Container[] {
  return containers.map(container => {
    if (container.items) {
      return {
        ...container,
        items: container.items.filter(item => !itemIds.includes(item.id))
      }
    } else if (container.children && container.children.length > 0) {
      return {
        ...container,
        children: deleteItemsFromContainers(container.children, itemIds)
      }
    }
    return container
  })
}

function addChildContainer(containers: Container[], parentId: string, newChild: Container): Container[] {
  return containers.map(container => {
    if (container.id === parentId) {
      return {
        ...container,
        children: [...(container.children || []), newChild]
      }
    } else if (container.children && container.children.length > 0) {
      return {
        ...container,
        children: addChildContainer(container.children, parentId, newChild)
      }
    }
    return container
  })
}

function moveItemsBetweenContainers(
  containers: Container[],
  itemIds: string[],
  sourceContainerId: string,
  targetContainerId: string
): Container[] {
  let itemsToMove: Item[] = []

  // First pass: extract items from source container
  const containersWithoutItems = containers.map(container => {
    if (container.id === sourceContainerId && container.items) {
      itemsToMove = container.items.filter(item => itemIds.includes(item.id))
      return {
        ...container,
        items: container.items.filter(item => !itemIds.includes(item.id))
      }
    } else if (container.children && container.children.length > 0) {
      return {
        ...container,
        children: moveItemsBetweenContainers(container.children, itemIds, sourceContainerId, targetContainerId)
      }
    }
    return container
  })

  // Second pass: add items to target container
  return containersWithoutItems.map(container => {
    if (container.id === targetContainerId) {
      const targetContainer = findContainerById(containersWithoutItems, targetContainerId)
      const updatedItems = itemsToMove.map(item => ({
        ...item,
        itemLocation: { path: targetContainer?.containerLocation.path || '' }
      }))

      return {
        ...container,
        items: [...(container.items || []), ...updatedItems]
      }
    } else if (container.children && container.children.length > 0) {
      return {
        ...container,
        children: moveItemsBetweenContainers(container.children, itemIds, sourceContainerId, targetContainerId)
      }
    }
    return container
  })
}

function moveContainer(containers: Container[], containerId: string, targetParentId?: string): Container[] {
  // This is a simplified version - in a real app you'd want more sophisticated container moving logic
  return containers
}

interface InventoryContextType {
  containers: Container[]
  selectedContainer: string | null
  selectedItems: Set<string>
  searchQuery: string
  expandedContainers: Set<string>
  // Actions
  selectContainer: (id: string | null) => void
  toggleContainerExpansion: (id: string) => void
  addItem: (item: Partial<Item>, containerId?: string) => void
  editItem: (item: Item) => void
  deleteItems: (itemIds: string[]) => void
  addLocation: (location: Partial<Container>, parentId?: string) => void
  editLocation: (container: Container) => void
  moveItems: (itemIds: string[], targetContainerId: string) => void
  moveItemBetweenContainers: (itemId: string, sourceContainerId: string, targetContainerId: string) => void
  toggleItemSelection: (itemId: string) => void
  selectAllItems: () => void
  deselectAllItems: () => void
  setSearchQuery: (query: string) => void
  findContainerById: (id: string) => Container | null
  getFilteredItems: () => Item[]
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [containers, setContainers] = useState<Container[]>(initialState.containers)
  const [selectedContainer, setSelectedContainer] = useState<string | null>(initialState.selectedContainer)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(initialState.selectedItems)
  const [searchQuery, setSearchQueryState] = useState<string>(initialState.searchQuery)
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(initialState.expandedContainers)

  const selectContainer = useCallback((id: string | null) => {
    setSelectedContainer(id)
    setSelectedItems(new Set())
  }, [])

  const toggleContainerExpansion = useCallback((id: string) => {
    setExpandedContainers(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(id)) {
        newExpanded.delete(id)
      } else {
        newExpanded.add(id)
      }
      return newExpanded
    })
  }, [])

  const addItem = useCallback((item: Partial<Item>, containerId?: string) => {
    const targetContainerId = containerId || selectedContainer

    if (!targetContainerId) {
      toast.error("Please select a container to add the item to.")
      return
    }

    const targetContainer = findContainerById(containers, targetContainerId)

    const newItem: Item = {
      id: uuidv4(),
      itemName: item.itemName || 'New Item',
      itemLocation: { path: targetContainer?.containerLocation.path || '' },
      description: item.description,
      image: item.image,
      itemMeasurements: item.itemMeasurements
    }

    setContainers(prevContainers => addItemToContainer(prevContainers, targetContainerId, newItem))
    setSelectedItems(new Set())
    toast.success("Item added successfully")
  }, [selectedContainer])

  const editItem = useCallback((updatedItem: Item) => {
    setContainers(prevContainers => updateItemInContainers(prevContainers, updatedItem))
    toast.success("Item updated successfully")
  }, [])

  const deleteItems = useCallback((itemIds: string[]) => {
    if (itemIds.length === 0) return

    setContainers(prevContainers => deleteItemsFromContainers(prevContainers, itemIds))
    setSelectedItems(new Set())
    toast.success(`${itemIds.length} item${itemIds.length > 1 ? 's' : ''} deleted successfully`)
  }, [])

  const addLocation = useCallback((location: Partial<Container>, parentId?: string) => {
    if (!location.containerName) {
      toast.error("Location name is required")
      return
    }

    const newLocation: Container = {
      id: uuidv4(),
      containerName: location.containerName,
      containerLocation: {
        path: parentId
          ? `${findContainerById(containers, parentId)?.containerLocation.path}/${location.containerName.replace(/\s/g, '_')}`
          : `/${location.containerName.replace(/\s/g, '_')}`
      },
      items: [],
      parentId: parentId || undefined,
      description: location.description,
      image: location.image
    }

    setContainers(prevContainers => parentId
      ? addChildContainer(prevContainers, parentId, newLocation)
      : [...prevContainers, newLocation]
    )

    toast.success("Location added successfully")
  }, [containers])

  const editLocation = useCallback((updatedContainer: Container) => {
    setContainers(prevContainers => updateContainerInTree(prevContainers, updatedContainer))
    toast.success("Location updated successfully")
  }, [])

  const moveItems = useCallback((itemIds: string[], targetContainerId: string) => {
    if (itemIds.length === 0) return

    setContainers(prevContainers => moveItemsBetweenContainers(prevContainers, itemIds, selectedContainer!, targetContainerId))
    setSelectedItems(new Set())
    toast.success(`${itemIds.length} items moved successfully`)
  }, [selectedContainer])

  const moveItemBetweenContainers = useCallback((itemId: string, sourceContainerId: string, targetContainerId: string) => {
    setContainers(prevContainers => moveItemsBetweenContainers(prevContainers, [itemId], sourceContainerId, targetContainerId))
    toast.success("Item moved successfully")
  }, [])

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId)
      } else {
        newSelected.add(itemId)
      }
      return newSelected
    })
  }, [])

  const selectAllItems = useCallback(() => {
    const container = findContainerById(containers, selectedContainer!)
    const allItemIds = container?.items?.map(item => item.id) || []
    setSelectedItems(new Set(allItemIds))
  }, [containers, selectedContainer])

  const deselectAllItems = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query)
  }, [])

  const findContainerByIdHelper = useCallback((id: string) => {
    return findContainerById(containers, id)
  }, [containers])

  const getFilteredItems = useCallback((): Item[] => {
    if (!selectedContainer) {
      // Return all items from all containers
      const allItems: Item[] = []
      const collectItems = (containers: Container[]) => {
        containers.forEach(container => {
          if (container.items) {
            allItems.push(...container.items)
          }
          if (container.children) {
            collectItems(container.children)
          }
        })
      }
      collectItems(containers)
      return allItems
    }

    const container = findContainerById(containers, selectedContainer)
    if (!container || !container.items) return []

    if (!searchQuery.trim()) return container.items

    const lowerQuery = searchQuery.toLowerCase()
    return container.items.filter(item =>
      item.itemName.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.itemLocation.path.toLowerCase().includes(lowerQuery)
    )
  }, [containers, selectedContainer, searchQuery])

  const value: InventoryContextType = {
    containers,
    selectedContainer,
    selectedItems,
    searchQuery,
    expandedContainers,
    selectContainer,
    toggleContainerExpansion,
    addItem,
    editItem,
    deleteItems,
    addLocation,
    editLocation,
    moveItems,
    moveItemBetweenContainers,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    setSearchQuery,
    findContainerById: findContainerByIdHelper,
    getFilteredItems
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}