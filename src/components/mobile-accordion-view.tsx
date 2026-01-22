"use client"

import * as React from "react"
import { Info, Move, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Item } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react"
import { LocationInfoModal } from "./modals/location-info-modal"
import { DraggableItem } from "./draggable-item"
import { DraggableContainer } from "./draggable-container"
import { DroppableContainer } from "./droppable-container"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FolderTree } from "./folder-tree"
import * as AccordionPrimitive from "@radix-ui/react-accordion"

interface MobileAccordionViewProps {
  containers: Container[]
  selectedContainer: string | null
  expandedContainers: Set<string>
  onContainerSelect: (id: string) => void
  onContainerToggle: (id: string) => void
  onViewAllItems: () => void
  onItemClick: (item: Item) => void
  onContainerEdit?: (container: Container) => void
  onMoveItem?: (itemId: string, targetContainerId: string) => void
  onMoveContainer?: (containerId: string, targetContainerId: string) => void
}

export function MobileAccordionView({
  containers,
  selectedContainer,
  expandedContainers,
  onContainerSelect,
  onContainerToggle,
  onViewAllItems,
  onItemClick,
  onContainerEdit,
  onMoveItem,
  onMoveContainer
}: MobileAccordionViewProps) {
  const [showInfoModal, setShowInfoModal] = React.useState(false)
  const [showMoveModal, setShowMoveModal] = React.useState(false)
  const [selectedContainerForModal, setSelectedContainerForModal] = React.useState<Container | null>(null)
  const [moveTarget, setMoveTarget] = React.useState<{ type: 'item' | 'container', id: string, name: string } | null>(null)

  const handleContainerInfo = (container: Container, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedContainerForModal(container)
    setShowInfoModal(true)
  }

  const handleEditContainer = (container: Container) => {
    if (onContainerEdit) {
      onContainerEdit(container)
    }
    setShowInfoModal(false)
  }

  const handleMoveClick = (type: 'item' | 'container', id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setMoveTarget({ type, id, name })
    setShowMoveModal(true)
  }

  const handleMoveToContainer = (targetContainerId: string) => {
    if (moveTarget) {
      if (moveTarget.type === 'item' && onMoveItem) {
        onMoveItem(moveTarget.id, targetContainerId)
      } else if (moveTarget.type === 'container' && onMoveContainer) {
        onMoveContainer(moveTarget.id, targetContainerId)
      }
    }
    setShowMoveModal(false)
    setMoveTarget(null)
  }

  // Alternating nesting background colors - solid, no transparency
  const getNestingStyle = (level: number, isSelected: boolean) => {
    if (isSelected) {
      return "bg-primary/15 dark:bg-primary/20"
    }
    // Alternate between two shades for visual hierarchy
    if (level % 2 === 0) {
      return "bg-background"
    } else {
      return "bg-muted"
    }
  }

  const renderContainer = (container: Container, level = 0): React.ReactNode => {
    const isSelected = selectedContainer === container.id
    const isExpanded = expandedContainers.has(container.id)
    const hasChildren = container.children && container.children.length > 0
    const hasItems = container.items && container.items.length > 0
    const folderIcon = level % 2 !== 0 
      ? "material-symbols:folder-outline-rounded" 
      : "material-symbols:folder-rounded"
    
    const nestingBg = getNestingStyle(level, isSelected)

    return (
      <DraggableContainer key={container.id} container={container}>
        <DroppableContainer
          key={`droppable-${container.id}-${container.items?.length || 0}-${container.children?.length || 0}`}
          containerId={container.id}
          container={container}
        >
          <AccordionPrimitive.Item
            value={container.id}
            className={cn(
              "border-b border-border",
              nestingBg
            )}
          >
            {/* Custom header that doesn't use AccordionTrigger (which is a button) */}
            <div className="flex items-center w-full">
              {/* Main clickable area for expanding/collapsing - NOT a button */}
              <div
                className={cn(
                  "flex-1 flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors",
                  "hover:bg-muted/50 active:bg-muted",
                  isSelected && "bg-primary/10 dark:bg-primary/15"
                )}
                style={{ paddingLeft: `${level * 12 + 12}px` }}
                onClick={() => {
                  onContainerSelect(container.id)
                  onContainerToggle(container.id)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onContainerSelect(container.id)
                    onContainerToggle(container.id)
                  }
                }}
                data-drag-handle="true"
              >
                <Icon
                  icon={folderIcon}
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className={cn(
                  "flex-1 text-left font-medium truncate text-sm",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {container.containerName}
                </span>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )} 
                />
              </div>
              
              {/* Action buttons - OUTSIDE the clickable area */}
              <div className="flex items-center gap-1 pr-2 flex-shrink-0">
                <button
                  type="button"
                  className="p-1.5 rounded-md hover:bg-muted active:bg-muted/80 transition-colors"
                  onClick={(e) => handleContainerInfo(container, e)}
                  aria-label={`View info for ${container.containerName}`}
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-md hover:bg-muted active:bg-muted/80 transition-colors"
                  onClick={(e) => handleMoveClick('container', container.id, container.containerName, e)}
                  aria-label={`Move ${container.containerName}`}
                >
                  <Move className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Content that expands/collapses */}
            <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div className="pb-1">
                {hasChildren && container.children && (
                  <AccordionPrimitive.Root 
                    type="multiple" 
                    className="w-full"
                    value={Array.from(expandedContainers)}
                  >
                    {container.children.map(childContainer => renderContainer(childContainer, level + 1))}
                  </AccordionPrimitive.Root>
                )}
                {hasItems && container.items && (
                  <DroppableContainer 
                    key={`items-droppable-${container.id}-${container.items.length}`}
                    containerId={container.id}
                  >
                    <div 
                      className="space-y-1 py-2 px-3"
                      style={{ paddingLeft: `${(level + 1) * 12 + 12}px` }}
                    >
                      {container.items.map(item => (
                        <DraggableItem
                          key={item.id}
                          item={item}
                          containerId={container.id}
                        >
                          <div
                            className={cn(
                              "item-row flex items-center gap-2 py-2 px-3 rounded-md",
                              "border border-border",
                              "bg-card hover:bg-muted/50 active:bg-muted",
                              "transition-all duration-200"
                            )}
                            onClick={() => onItemClick(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && onItemClick(item)}
                            data-drag-handle="false"
                          >
                            <Icon icon="material-symbols:indeterminate-check-box" className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate text-sm font-medium flex-1">{item.itemName}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                className="p-1 rounded-md hover:bg-muted/50 active:bg-muted transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onItemClick(item)
                                }}
                                aria-label={`View details for ${item.itemName}`}
                              >
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </button>
                              <button
                                type="button"
                                className="p-1 rounded-md hover:bg-muted/50 active:bg-muted transition-colors"
                                onClick={(e) => handleMoveClick('item', item.id, item.itemName, e)}
                                aria-label={`Move ${item.itemName}`}
                              >
                                <Move className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                        </DraggableItem>
                      ))}
                    </div>
                  </DroppableContainer>
                )}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        </DroppableContainer>
      </DraggableContainer>
    )
  }

  // Get all expanded container IDs for Accordion
  const expandedValues = Array.from(expandedContainers)

  return (
    <div className="mobile-accordion-view w-full h-full overflow-y-auto bg-background">
      {/* Actions Bar - View All Items in same section */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-3 py-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2 h-9"
          onClick={onViewAllItems}
        >
          <Icon icon="material-symbols:indeterminate-check-box" className="h-4 w-4" />
          <span className="text-sm">View All Items</span>
        </Button>
      </div>

      {/* Container List */}
      <div className="bg-background">
        <AccordionPrimitive.Root 
          type="multiple" 
          className="w-full"
          value={expandedValues}
          onValueChange={(values) => {
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
        </AccordionPrimitive.Root>
      </div>

      <LocationInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        container={selectedContainerForModal}
        onEdit={handleEditContainer}
      />

      <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move "{moveTarget?.name}"</DialogTitle>
            <DialogDescription>Select a destination folder</DialogDescription>
          </DialogHeader>
          <div className="py-2 max-h-[50vh] overflow-y-auto">
            <FolderTree
              containers={containers}
              selectedContainer={null}
              expandedContainers={expandedContainers}
              onContainerSelect={(id) => handleMoveToContainer(id)}
              onContainerToggle={onContainerToggle}
              onViewAllItems={() => {}}
              onItemClick={() => {}}
              onContainerEdit={onContainerEdit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
