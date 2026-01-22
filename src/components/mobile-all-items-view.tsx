"use client"

import * as React from "react"
import { ArrowLeft, Info, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Item } from "@/lib/types"
import { cn, getPlaceholderImage } from "@/lib/utils"
import { DraggableItem } from "./draggable-item"
import { Icon } from "@iconify/react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FolderTree } from "./folder-tree"
import { Container } from "@/lib/types"

interface MobileAllItemsViewProps {
  items: Item[]
  selectedItems: string[]
  containers: Container[]
  expandedContainers: Set<string>
  containerId?: string
  onSelectItems: (itemIds: string[]) => void
  onViewItem: (item: Item) => void
  onViewPhoto: (item: Item) => void
  onBack: () => void
  onMoveItem?: (itemId: string, targetContainerId: string) => void
  onContainerToggle: (id: string) => void
}

export function MobileAllItemsView({
  items,
  selectedItems,
  containers,
  expandedContainers,
  containerId,
  onSelectItems,
  onViewItem,
  onViewPhoto,
  onBack,
  onMoveItem,
  onContainerToggle
}: MobileAllItemsViewProps) {
  const [showMoveModal, setShowMoveModal] = React.useState(false)
  const [moveTargetItemId, setMoveTargetItemId] = React.useState<string | null>(null)

  const handleSelectItem = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const newSelected = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId]
    onSelectItems(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectItems([])
    } else {
      onSelectItems(items.map(item => item.id))
    }
  }

  const handleMoveClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMoveTargetItemId(itemId)
    setShowMoveModal(true)
  }

  const handleMoveToContainer = (targetContainerId: string) => {
    if (moveTargetItemId && onMoveItem) {
      onMoveItem(moveTargetItemId, targetContainerId)
    }
    setShowMoveModal(false)
    setMoveTargetItemId(null)
  }

  const getItemImage = (item: Item): string => {
    if (item.image) return item.image
    return getPlaceholderImage('item', item.itemName)
  }

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = event.currentTarget
    imgElement.src = '/placeholder-item.png'
  }

  if (items.length === 0) {
    return (
      <div className="mobile-all-items-view w-full h-full flex flex-col">
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold flex-1">All Items</h2>
        </div>
        <div className="empty-state text-center py-12 flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No items found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-all-items-view w-full h-full flex flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold flex-1">All Items ({items.length})</h2>
      </div>

      {items.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-sm"
          >
            {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
          </Button>
          {selectedItems.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedItems.length} selected
            </span>
          )}
        </div>
      )}
      
      <div className="flex-1 p-4 space-y-3">
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            containerId={containerId || ''}
          >
            <Card
              className={cn(
                "cursor-pointer transition-all duration-200 active:scale-[0.98] hover:shadow-md",
                selectedItems.includes(item.id) && "ring-2 ring-primary"
              )}
              onClick={() => onViewItem(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Checkbox - smaller and centered */}
                  <button
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border shadow-sm transition-colors flex-shrink-0 self-center",
                      "border-black dark:border-white",
                      "active:scale-95"
                    )}
                    style={{
                      backgroundColor: 'white',
                      borderColor: 'black',
                    }}
                    onClick={(e) => handleSelectItem(item.id, e)}
                    aria-label={`Select ${item.itemName}`}
                  >
                    {selectedItems.includes(item.id) && (
                      <Icon icon="material-symbols:check" className="h-3 w-3" style={{ color: 'black' }} />
                    )}
                  </button>

                  {/* Image */}
                  <div
                    className="relative w-16 h-16 overflow-hidden rounded-md flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewPhoto(item)
                    }}
                  >
                    <img
                      src={getItemImage(item)}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate">{item.itemName}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Icon icon="material-symbols:location-on" className="w-4 h-4" />
                        <span className="truncate">{item.itemLocation.path}</span>
                      </div>
                      {item.itemMeasurements && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Icon icon="material-symbols:tag" className="w-4 h-4" />
                          <span>{item.itemMeasurements.size} {item.itemMeasurements.unit}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      className="p-1.5 rounded-md hover:bg-muted/50 active:bg-muted transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewItem(item)
                      }}
                      aria-label={`View details for ${item.itemName}`}
                    >
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-muted/50 active:bg-muted transition-colors"
                      onClick={(e) => handleMoveClick(item.id, e)}
                      aria-label={`Move ${item.itemName}`}
                    >
                      <Move className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DraggableItem>
        ))}
      </div>

      <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Move Item To</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FolderTree
              containers={containers}
              selectedContainer={null}
              expandedContainers={expandedContainers}
              onContainerSelect={(id) => handleMoveToContainer(id)}
              onContainerToggle={onContainerToggle}
              onViewAllItems={() => {}}
              onItemClick={() => {}}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
