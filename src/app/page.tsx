"use client"

import { useState } from "react"
import { InventoryProvider, useInventory } from "@/lib/inventory-context"
import { Item } from "@/lib/types"
import { Header } from "@/components/header"
import { FolderTree } from "@/components/folder-tree"
import { InventoryTable } from "@/components/inventory-table"
import { AddItemModal } from "@/components/modals/add-item-modal"
import { NewLocationModal } from "@/components/modals/new-location-modal"
import { GroupItemsModal } from "@/components/modals/group-items-modal"
import { HelpModal } from "@/components/modals/help-modal"
import { ItemDetailsModal } from "@/components/modals/item-details-modal"
import { PhotoViewModal } from "@/components/modals/photo-view-modal"
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
    addLocation,
    editLocation,
    moveItems,
    moveItemBetweenContainers,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    setSearchQuery,
    findContainerById,
    getFilteredItems
  } = useInventory()

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || !overData) return

    // Handle item being dropped on container
    if (activeData.type === 'item' && overData.type === 'container') {
      const itemId = active.id as string
      const sourceContainerId = activeData.containerId as string
      const targetContainerId = over.id as string

      if (sourceContainerId !== targetContainerId) {
        moveItemBetweenContainers(itemId, sourceContainerId, targetContainerId)
      }
    }

    // Handle container being dropped on container (moving folders)
    // Note: This would require a moveContainer function in the context
    // For now, we'll just log it - you can implement this later
    if (activeData.type === 'container' && overData.type === 'container') {
      const containerId = active.id as string
      const targetContainerId = over.id as string

      if (containerId !== targetContainerId) {
        // TODO: Implement container moving logic
        console.log(`Move container ${containerId} to ${targetContainerId}`)
      }
    }
  }

  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showAddLocationModal, setShowAddLocationModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
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
    <DndProviderWrapper onDragEnd={handleDragEnd}>
      <div className="app-container">
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
                    setShowPhotoModal(true)
                  }}
                />
              )}
            </div>
          </div>
        </div>

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
        onClose={() => setShowItemDetailsModal(false)}
        item={activeItem}
        onEdit={editItem}
        onAddItem={addItem}
      />

      <PhotoViewModal
        open={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        item={activeItem}
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
