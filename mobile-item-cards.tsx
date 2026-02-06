"use client"

import * as React from "react"
import { Item } from "@/lib/types"
import { cn, getPlaceholderImage } from "@/lib/utils"
import { DraggableItem } from "./draggable-item"
import { Icon } from "@iconify/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface MobileItemCardsProps {
  items: Item[]
  selectedItems: string[]
  containerId?: string
  onSelectItems: (itemIds: string[]) => void
  onViewItem: (item: Item) => void
  onViewPhoto: (item: Item) => void
}

export function MobileItemCards({
  items,
  selectedItems,
  containerId,
  onSelectItems,
  onViewItem,
  onViewPhoto
}: MobileItemCardsProps) {
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
      <div className="empty-state text-center py-12">
        <p className="text-muted-foreground mb-4">No items found</p>
      </div>
    )
  }

  return (
    <div className="mobile-item-cards w-full space-y-3 pb-4">
      {items.length > 0 && (
        <div className="flex items-center justify-between px-2 py-2 border-b border-border">
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
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-sm border shadow-sm transition-colors mt-0.5 flex-shrink-0",
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
                    <Icon icon="material-symbols:check" className="h-4 w-4" style={{ color: 'black' }} />
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
              </div>
            </CardContent>
          </Card>
        </DraggableItem>
      ))}
    </div>
  )
}
