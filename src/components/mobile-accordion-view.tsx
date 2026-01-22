"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Info, Move } from "lucide-react"
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
  onContainerDelete?: (containerId: string) => void
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
  onMoveContainer,
  onContainerDelete
}: MobileAccordionViewProps) {
  const [showInfoModal, setShowInfoModal] = React.useState(false)
  const [showMoveModal, setShowMoveModal] = React.useState(false)
  const [selectedContainerForModal, setSelectedContainerForModal] = React.useState<Container | null>(null)
  const [moveTarget, setMoveTarget] = React.useState<{ type: 'item' | 'container', id: string, name: string } | null>(null)

  const isContainerExpanded = (containerId: string) => {
    return expandedContainers.has(containerId)
  }

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

  // Get folder icon based on level (matching desktop FolderTree)
  const getFolderIcon = (level: number): string => {
    const isOddLevel = level % 2 !== 0
    return isOddLevel ? "material-symbols:folder-outline-rounded" : "material-symbols:folder-rounded"
  }

  const renderContainer = (container: Container, level = 0): React.ReactNode => {
    const isExpanded = isContainerExpanded(container.id)
    const isSelected = selectedContainer === container.id
    const hasChildren = container.children && container.children.length > 0
    const hasItems = container.items && container.items.length > 0
    const isCollapsible = hasChildren || hasItems
    const folderIcon = getFolderIcon(level)

    return (
      <div key={`${container.id}-${container.containerName}`} className="container-wrapper">
        <DroppableContainer
          key={`droppable-${container.id}-${container.items?.length || 0}-${container.children?.length || 0}`}
          containerId={container.id}
          container={container}
        >
          <DraggableContainer container={container}>
            <div
              className={cn(
                "folder-item relative",
                isSelected && "folder-selected"
              )}
              data-container-id={container.id}
            >
              {/* Folder Header - MUST have folder-header class for DnD to work */}
              <div
                className={cn(
                  "folder-header flex items-center py-2 px-3 cursor-pointer rounded-md transition-all duration-200",
                  isSelected && "selected bg-primary/15 dark:bg-primary/20"
                )}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onClick={() => onContainerSelect(container.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onContainerSelect(container.id)}
                data-drag-handle="true"
              >
                {/* Expand/Collapse Button */}
                {isCollapsible ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto mr-1 min-h-0 min-w-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onContainerToggle(container.id)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                    )}
                  </Button>
                ) : (
                  <div className="w-5 mr-1" />
                )}

                {/* Folder Icon */}
                <Icon
                  icon={folderIcon}
                  className={cn(
                    "h-5 w-5 mr-2 transition-colors flex-shrink-0",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                />

                {/* Folder Name */}
                <span className={cn(
                  "folder-name flex-1 truncate text-sm font-medium",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {container.containerName}
                </span>

                {/* Action Buttons */}
                <div className="flex items-center gap-0.5 ml-auto">
                  <button
                    type="button"
                    className="info-icon p-1.5 rounded-full hover:bg-muted active:bg-muted/80 transition-colors"
                    onClick={(e) => handleContainerInfo(container, e)}
                    aria-label={`View info for ${container.containerName}`}
                  >
                    <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-full hover:bg-muted active:bg-muted/80 transition-colors"
                    onClick={(e) => handleMoveClick('container', container.id, container.containerName, e)}
                    aria-label={`Move ${container.containerName}`}
                  >
                    <Move className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="pl-4">
                  {/* Nested Containers */}
                  {hasChildren && container.children && (
                    <div className="nested-container-list">
                      {container.children.map(childContainer => renderContainer(childContainer, level + 1))}
                    </div>
                  )}

                  {/* Items List */}
                  {hasItems && container.items && (
                    <DroppableContainer
                      key={`items-droppable-${container.id}-${container.items.length}`}
                      containerId={container.id}
                    >
                      <div className="items-list pl-2">
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
                              <Icon icon="material-symbols:indeterminate-check-box" className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                              <span className="truncate text-sm text-muted-foreground flex-1">{item.itemName}</span>
                              <div className="flex items-center gap-0.5 ml-2">
                                <button
                                  type="button"
                                  className="p-1 rounded-md hover:bg-muted/50 active:bg-muted transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onItemClick(item)
                                  }}
                                  aria-label={`View details for ${item.itemName}`}
                                >
                                  <Icon icon="material-symbols:info-outline" className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                                </button>
                                <button
                                  type="button"
                                  className="p-1 rounded-md hover:bg-muted/50 active:bg-muted transition-colors"
                                  onClick={(e) => handleMoveClick('item', item.id, item.itemName, e)}
                                  aria-label={`Move ${item.itemName}`}
                                >
                                  <Move className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                                </button>
                              </div>
                            </div>
                          </DraggableItem>
                        ))}
                      </div>
                    </DroppableContainer>
                  )}
                </div>
              )}
            </div>
          </DraggableContainer>
        </DroppableContainer>
      </div>
    )
  }

  return (
    <div className="mobile-accordion-view w-full h-full overflow-y-auto bg-background">
      {/* Container List - uses same folder-tree styles as desktop */}
      <div className="folder-tree p-2 bg-background">
        <div className="container-list">
          {containers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No folders found
            </div>
          ) : (
            containers.map(container => renderContainer(container))
          )}
        </div>
      </div>

      {/* Info Modal */}
      <LocationInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        container={selectedContainerForModal}
        onEdit={handleEditContainer}
        onDelete={onContainerDelete}
      />

      {/* Move Modal */}
      <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
        <DialogContent className="sm:max-w-md">
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
              onViewAllItems={() => { }}
              onItemClick={() => { }}
              onContainerEdit={onContainerEdit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
