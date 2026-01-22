"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Item } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Icon } from "@iconify/react"
import { LocationInfoModal } from "./modals/location-info-modal"
import { DraggableItem } from "./draggable-item"
import { DraggableContainer } from "./draggable-container"
import { DroppableContainer } from "./droppable-container"

interface MobileContainerAccordionProps {
  containers: Container[]
  selectedContainer: string | null
  expandedContainers: Set<string>
  onContainerSelect: (id: string) => void
  onContainerToggle: (id: string) => void
  onViewAllItems: () => void
  onItemClick: (item: Item) => void
  onContainerEdit?: (container: Container) => void
}

export function MobileContainerAccordion({
  containers,
  selectedContainer,
  expandedContainers,
  onContainerSelect,
  onContainerToggle,
  onViewAllItems,
  onItemClick,
  onContainerEdit
}: MobileContainerAccordionProps) {
  const [showInfoModal, setShowInfoModal] = React.useState(false)
  const [selectedContainerForModal, setSelectedContainerForModal] = React.useState<Container | null>(null)

  const isContainerExpanded = (containerId: string) => {
    return expandedContainers.has(containerId)
  }

  const handleContainerInfo = (container: Container, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedContainerForModal(container)
    setShowInfoModal(true)
  }

  const handleEditContainer = (container: Container) => {
    if (onContainerEdit) {
      onContainerEdit(container)
    }
    setShowInfoModal(false)
  }

  // Get all expanded container IDs for Accordion
  const expandedValues = Array.from(expandedContainers)

  const renderContainer = (container: Container, level = 0): React.ReactNode => {
    const isExpanded = isContainerExpanded(container.id)
    const isSelected = selectedContainer === container.id
    const hasChildren = container.children && container.children.length > 0
    const hasItems = container.items && container.items.length > 0
    const isCollapsible = hasChildren || hasItems

    const folderIcon = level % 2 !== 0 
      ? "material-symbols:folder-outline-rounded" 
      : "material-symbols:folder-rounded"

    return (
      <AccordionItem
        key={container.id}
        value={container.id}
        className="border-b border-border"
      >
        <AccordionTrigger
          className={cn(
            "hover:no-underline px-4 py-3 transition-all duration-200",
            isSelected && "bg-muted"
          )}
          onClick={(e) => {
            e.stopPropagation()
            onContainerSelect(container.id)
          }}
        >
          <div className="flex items-center w-full" onClick={(e) => e.stopPropagation()}>
            <Icon
              icon={folderIcon}
              className={cn(
                "h-5 w-5 mr-2 transition-colors",
                isSelected ? "text-primary" : "text-foreground"
              )}
            />
            <span className="flex-1 text-left font-medium">{container.containerName}</span>
            <button
              className="p-1.5 rounded-full hover:bg-muted/50 transition-colors ml-2"
              onClick={(e) => handleContainerInfo(container, e)}
              aria-label={`View info for ${container.containerName}`}
            >
              <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </button>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-2">
          {hasChildren && container.children && (
            <div className="ml-4 space-y-1">
              {container.children.map(childContainer => renderContainer(childContainer, level + 1))}
            </div>
          )}
          {hasItems && container.items && (
            <DroppableContainer 
              key={`items-droppable-${container.id}-${container.items.length}`}
              containerId={container.id}
            >
              <div className="ml-4 space-y-1 mt-2">
                {container.items.map(item => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    containerId={container.id}
                  >
                    <div
                      className="item-row flex items-center py-2 px-3 my-1 cursor-pointer hover:bg-muted rounded-md transition-all duration-200 active:scale-[0.98]"
                      onClick={() => onItemClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && onItemClick(item)}
                      data-drag-handle="false"
                    >
                      <Icon icon="material-symbols:indeterminate-check-box" className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span className="truncate text-sm text-muted-foreground flex-1">{item.itemName}</span>
                      <button
                        className="p-1 rounded-md hover:bg-muted/50 transition-all duration-200 ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          onItemClick(item)
                        }}
                        aria-label={`View details for ${item.itemName}`}
                      >
                        <Icon icon="material-symbols:info-outline" className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      </button>
                    </div>
                  </DraggableItem>
                ))}
              </div>
            </DroppableContainer>
          )}
        </AccordionContent>
      </AccordionItem>
    )
  }

  return (
    <div className="mobile-container-accordion w-full">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-start px-4 py-3 mb-2 text-sm font-medium"
        onClick={onViewAllItems}
      >
        <Icon icon="material-symbols:indeterminate-check-box" className="h-5 w-5 mr-2" />
        <span>View All Items</span>
      </Button>

      <Accordion 
        type="multiple" 
        className="w-full"
        value={expandedValues}
        onValueChange={(values) => {
          // Sync accordion state with expanded containers
          const newExpanded = new Set(values)
          expandedContainers.forEach(id => {
            if (!newExpanded.has(id)) {
              onContainerToggle(id)
            }
          })
          values.forEach(id => {
            if (!expandedContainers.has(id)) {
              onContainerToggle(id)
            }
          })
        }}
      >
        {containers.map(container => renderContainer(container))}
      </Accordion>

      <LocationInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        container={selectedContainerForModal}
        onEdit={handleEditContainer}
      />
    </div>
  )
}
