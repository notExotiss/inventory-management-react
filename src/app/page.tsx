"use client"

import { useState, useEffect } from "react"
import { InventoryProvider, useInventory } from "@/lib/inventory-context"
import { Item, Container } from "@/lib/types"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { FolderTree } from "@/components/folder-tree"
import { MobileAccordionView } from "@/components/mobile-accordion-view"
import { MobileAllItemsView } from "@/components/mobile-all-items-view"
import { InventoryTable } from "@/components/inventory-table"
import { AddItemModal } from "@/components/modals/add-item-modal"
import { NewLocationModal } from "@/components/modals/new-location-modal"
import { GroupItemsModal } from "@/components/modals/group-items-modal"
import { HelpModal } from "@/components/modals/help-modal"
import { ItemDetailsModal } from "@/components/modals/item-details-modal"
import { DndProviderWrapper } from "@/components/dnd-provider"

function InventoryApp() {
  const {
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
    deleteContainer,
    addLocation,
    editLocation,
    moveItems,
    moveItemBetweenContainers,
    moveContainerBetweenContainers,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    setSearchQuery,
    findContainerById,
    getFilteredItems,
    undo,
    canUndo
  } = useInventory()

  const [dndKey, setDndKey] = useState(0)

  const [isMobile, setIsMobile] = useState(false)
  const [showAllItemsView, setShowAllItemsView] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleUndo = () => {
    undo()
    setTimeout(() => {
      setDndKey(prev => prev + 1)
    }, 100)
  }

  const getAllContainerIds = (containerList: Container[]): string[] => {
    const ids: string[] = []
    const traverse = (containers: Container[]) => {
      containers.forEach(container => {
        ids.push(container.id)
        if (container.children && container.children.length > 0) {
          traverse(container.children)
        }
      })
    }
    traverse(containerList)
    return ids
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (!over) {
      return
    }

    const activeData = active.data.current
    const overData = over.data.current

    console.log('Drag end event:', {
      activeId: active.id,
      overId: over.id,
      activeData,
      overData
    })

    if (!activeData || !overData) {
      console.warn('Missing active or over data')
      return
    }

    if (activeData.type === 'item' && overData.type === 'container') {
      const itemId = active.id as string
      const sourceContainerId = activeData.containerId as string
      const targetContainerId = over.id as string

      if (sourceContainerId && targetContainerId && sourceContainerId !== targetContainerId) {
        moveItemBetweenContainers(itemId, sourceContainerId, targetContainerId)
      }
    }

    if (activeData.type === 'container' && overData.type === 'container') {
      const containerId = active.id as string
      const targetContainerId = over.id as string

      console.log('Container drag detected:', {
        containerId,
        targetContainerId,
        activeData: activeData.container,
        overData: overData.containerId
      })

      if (containerId && targetContainerId && containerId !== targetContainerId) {
        const sourceContainer = activeData.container || findContainerById(containerId)

        const targetContainer = overData.container || findContainerById(targetContainerId)

        console.log('Container lookup:', {
          containerId,
          targetContainerId,
          sourceFound: !!sourceContainer,
          targetFound: !!targetContainer,
          sourceId: sourceContainer?.id,
          targetId: targetContainer?.id,
          sourceFromData: !!activeData.container,
          targetFromData: !!overData.container,
          containersLength: containers.length,
          allContainerIds: getAllContainerIds(containers)
        })

        if (sourceContainer && targetContainer) {
          const isChild = (parent: Container, childId: string): boolean => {
            if (parent.children) {
              for (const child of parent.children) {
                if (child.id === childId) return true
                if (child.children && isChild(child, childId)) return true
              }
            }
            return false
          }

          if (sourceContainer.parentId === targetContainerId) {
            return
          }

          if (!isChild(sourceContainer, targetContainerId)) {
            console.log('Moving container:', containerId, 'to parent:', targetContainerId)
            moveContainerBetweenContainers(containerId, targetContainerId)
          } else {
            const { toast } = require('sonner')
            toast.error("Cannot move folder into its own subfolder")
          }
        } else {
          console.warn('Source or target container not found')
        }
      }
    }
  }

  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showAddLocationModal, setShowAddLocationModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false)
  const [activeItem, setActiveItem] = useState<Item | null>(null)

  const filteredItems = getFilteredItems()

  const handleAddItem = (item: any) => {
    addItem(item, selectedContainer || undefined)
    setShowAddItemModal(false)
  }

  const handleAddLocation = (location: any) => {
    addLocation(location, selectedContainer || undefined)
    setShowAddLocationModal(false)
  }

  const handleGroupItems = (locationId: string) => {
    moveItems(Array.from(selectedItems), locationId)
    setShowGroupModal(false)
  }

  return (
    <DndProviderWrapper key={dndKey} onDragEnd={handleDragEnd}>
      <div className="app-container">
        {isMobile ? (
          <>
            <MobileHeader
              searchQuery={searchQuery}
              selectedItems={Array.from(selectedItems)}
              onSearchChange={setSearchQuery}
              onClearSelection={deselectAllItems}
              onDelete={() => deleteItems(Array.from(selectedItems))}
              onGroupIntoLocation={() => setShowGroupModal(true)}
              onAddItem={() => setShowAddItemModal(true)}
              onAddLocation={() => setShowAddLocationModal(true)}
              onViewAllItems={() => {
                selectContainer(null)
                setShowAllItemsView(true)
              }}
              onShowHelp={() => setShowHelpModal(true)}
              onUndo={handleUndo}
              canUndo={canUndo()}
            />

            <div className="mobile-main-content">
              {showAllItemsView ? (
                <MobileAllItemsView
                  items={filteredItems}
                  selectedItems={Array.from(selectedItems)}
                  containers={containers}
                  expandedContainers={expandedContainers}
                  containerId={selectedContainer || undefined}
                  onSelectItems={(items) => {
                    deselectAllItems()
                    items.forEach(itemId => toggleItemSelection(itemId))
                  }}
                  onViewItem={(item) => {
                    setActiveItem(item)
                    setShowItemDetailsModal(true)
                  }}
                  onViewPhoto={(item) => {
                    setActiveItem(item)
                    setShowItemDetailsModal(true)
                  }}
                  onBack={() => setShowAllItemsView(false)}
                  onMoveItem={(itemId, targetContainerId) => {
                    // Find source container for the item
                    const findItemContainer = (containers: Container[], itemId: string): Container | null => {
                      for (const container of containers) {
                        if (container.items?.some(item => item.id === itemId)) {
                          return container
                        }
                        if (container.children) {
                          const found = findItemContainer(container.children, itemId)
                          if (found) return found
                        }
                      }
                      return null
                    }
                    const sourceContainer = findItemContainer(containers, itemId)
                    if (sourceContainer) {
                      moveItemBetweenContainers(itemId, sourceContainer.id, targetContainerId)
                    }
                  }}
                  onContainerToggle={toggleContainerExpansion}
                />
              ) : (
                <MobileAccordionView
                  containers={containers}
                  selectedContainer={selectedContainer}
                  expandedContainers={expandedContainers}
                  onContainerSelect={selectContainer}
                  onContainerToggle={toggleContainerExpansion}
                  onViewAllItems={() => {
                    selectContainer(null)
                    setShowAllItemsView(true)
                  }}
                  onItemClick={(item) => {
                    setActiveItem(item)
                    setShowItemDetailsModal(true)
                  }}
                  onContainerEdit={editLocation}
                  onMoveItem={(itemId, targetContainerId) => {
                    // Find source container for the item
                    const findItemContainer = (containers: Container[], itemId: string): Container | null => {
                      for (const container of containers) {
                        if (container.items?.some(item => item.id === itemId)) {
                          return container
                        }
                        if (container.children) {
                          const found = findItemContainer(container.children, itemId)
                          if (found) return found
                        }
                      }
                      return null
                    }
                    const sourceContainer = findItemContainer(containers, itemId)
                    if (sourceContainer) {
                      moveItemBetweenContainers(itemId, sourceContainer.id, targetContainerId)
                    }
                  }}
                  onMoveContainer={(containerId, targetContainerId) => {
                    moveContainerBetweenContainers(containerId, targetContainerId)
                  }}
                  onContainerDelete={deleteContainer}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <Header
              searchQuery={searchQuery}
              selectedItems={Array.from(selectedItems)}
              onSearchChange={setSearchQuery}
              onClearSelection={deselectAllItems}
              onDelete={() => deleteItems(Array.from(selectedItems))}
              onGroupIntoLocation={() => setShowGroupModal(true)}
              onAddItem={() => setShowAddItemModal(true)}
              onAddLocation={() => setShowAddLocationModal(true)}
              onShowHelp={() => setShowHelpModal(true)}
              onUndo={handleUndo}
              canUndo={canUndo()}
            />

            <div className="main-content">
              <div className="sidebar">
                <FolderTree
                  containers={containers}
                  selectedContainer={selectedContainer}
                  expandedContainers={expandedContainers}
                  onContainerSelect={selectContainer}
                  onContainerToggle={toggleContainerExpansion}
                  onViewAllItems={() => selectContainer(null)}
                  onItemClick={(item) => {
                    setActiveItem(item)
                    setShowItemDetailsModal(true)
                  }}
                  onContainerEdit={editLocation}
                  onContainerDelete={deleteContainer}
                />
              </div>

              <div className="content-area">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-1">
                      {selectedContainer ? (
                        findContainerById(selectedContainer)?.containerName || 'Location'
                      ) : filteredItems.length > 0 ? (
                        `All Items (${filteredItems.length})`
                      ) : (
                        'Contents'
                      )}
                    </h2>
                    {selectedContainer && (
                      <p className="text-sm text-muted-foreground">
                        {findContainerById(selectedContainer)?.containerLocation.path}
                      </p>
                    )}
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="empty-state">
                      <p className="text-muted-foreground mb-4">No items found</p>
                      <button
                        className="action-button mt-2"
                        onClick={() => setShowAddItemModal(true)}
                      >
                        Add Item
                      </button>
                    </div>
                  ) : (
                    <InventoryTable
                      items={filteredItems}
                      selectedItems={Array.from(selectedItems)}
                      containerId={selectedContainer || undefined}
                      onSelectItems={(items) => {
                        deselectAllItems()
                        items.forEach(itemId => toggleItemSelection(itemId))
                      }}
                      onViewItem={(item) => {
                        setActiveItem(item)
                        setShowItemDetailsModal(true)
                      }}
                      onViewPhoto={(item) => {
                        setActiveItem(item)
                        setShowItemDetailsModal(true)
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <AddItemModal
          open={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          onAddItem={handleAddItem}
          defaultLocation={selectedContainer
            ? findContainerById(selectedContainer)?.containerLocation.path || ''
            : ''}
        />

        <NewLocationModal
          open={showAddLocationModal}
          onClose={() => setShowAddLocationModal(false)}
          onAddLocation={handleAddLocation}
        />

        <GroupItemsModal
          open={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          onGroup={handleGroupItems}
          containers={containers}
          selectedItems={Array.from(selectedItems).map(id => {
            const container = findContainerById(selectedContainer || '')
            if (container && container.items) {
              const item = container.items.find(item => item.id === id)
              if (item) return item
            }
            return { id, itemName: 'Unknown item', itemLocation: { path: '' } }
          })}
        />

        <HelpModal
          open={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />

        <ItemDetailsModal
          open={showItemDetailsModal}
          onClose={() => {
            setShowItemDetailsModal(false)
          }}
          item={activeItem}
          onEdit={editItem}
          onAddItem={addItem}
          onDelete={(itemId) => deleteItems([itemId])}
        />
      </div>
    </DndProviderWrapper>
  )
}

export default function Home() {
  return (
    <InventoryProvider>
      <InventoryApp />
    </InventoryProvider>
  )
}
