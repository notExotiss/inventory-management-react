"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container, Item } from "@/lib/types"
import { cn } from "@/lib/utils"
import { DroppableContainer } from "./droppable-container"
import { Icon } from "@iconify/react"
import { LocationInfoModal } from "./modals/location-info-modal"
import { DraggableItem } from "./draggable-item"
import { DraggableContainer } from "./draggable-container"

interface FolderTreeProps {
  containers: Container[]
  selectedContainer: string | null
  expandedContainers: Set<string>
  onContainerSelect: (id: string) => void
  onContainerToggle: (id: string) => void
  onViewAllItems: () => void
  onItemClick: (item: Item) => void
  onContainerEdit?: (container: Container) => void
}

export function FolderTree({
  containers,
  selectedContainer,
  expandedContainers,
  onContainerSelect,
  onContainerToggle,
  onViewAllItems,
  onItemClick,
  onContainerEdit
}: FolderTreeProps) {
  const [showInfoModal, setShowInfoModal] = React.useState(false)
  const [selectedContainerForModal, setSelectedContainerForModal] = React.useState<Container | null>(null)

  const toggleContainer = (id: string) => {
    onContainerToggle(id)
  }

  const isContainerExpanded = (containerId: string) => {
    return expandedContainers.has(containerId)
  }

  const handleContainerInfo = (container: Container) => {
    setSelectedContainerForModal(container)
    setShowInfoModal(true)
  }

  const handleEditContainer = (container: Container) => {
    if (onContainerEdit) {
      onContainerEdit(container)
    }
    setShowInfoModal(false)
  }

  const getFolderIcon = (container: Container, isSelected: boolean, level: number): string => {
    const isOddLevel = level % 2 !== 0
    return isOddLevel ? "material-symbols:folder-outline-rounded" : "material-symbols:folder-rounded"
  }

  const renderContainer = (container: Container, level = 0) => {
    const isExpanded = isContainerExpanded(container.id)
    const isSelected = selectedContainer === container.id
    const hasChildren = container.children && container.children.length > 0
    const hasItems = container.items && container.items.length > 0
    // Make all folders collapsible - if they have children or items, they can be expanded
    const isCollapsible = hasChildren || hasItems

    const folderIcon = getFolderIcon(container, isSelected, level)

    return (
        <div key={`${container.id}-${container.containerName}`} className="container-wrapper">
        <DroppableContainer
          key={`droppable-${container.id}-${container.items?.length || 0}-${container.children?.length || 0}`}
          containerId={container.id}
          container={container}
        >
          <DraggableContainer container={container}>
            <div className={cn("folder-item relative transition-all duration-300 animate-in fade-in slide-in-from-left-2", isSelected && "folder-selected")} data-container-id={container.id} data-drag-handle="true">
              <div
                className={cn("folder-header transition-all duration-200 hover:scale-[1.02] hover:shadow-sm", isSelected && "selected")}
                style={{ paddingLeft: `${level * 16}px` }}
                onClick={() => onContainerSelect(container.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onContainerSelect(container.id)}
                data-drag-handle="true"
              >
              <div className="flex items-center w-full">
                {isCollapsible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto mr-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleContainer(container.id)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                    )}
                  </Button>
                )}
                {!isCollapsible && <div className="w-5 mr-1" />}

                <Icon
                  icon={folderIcon}
                  className={cn(
                    "h-5 w-5 mr-2 transition-colors",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                />
                <span className="folder-name">{container.containerName}</span>

                <div className="ml-auto flex">
                  <button
                    className="info-icon p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleContainerInfo(container)
                    }}
                    aria-label="View/edit location"
                  >
                    <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {isExpanded && hasChildren && container.children && (
              <div className="pl-4">
                <div className="nested-container-list">
                  {container.children.map(childContainer => renderContainer(childContainer, level + 1))}
                </div>
              </div>
            )}

            {isExpanded && hasItems && container.items && (
              <DroppableContainer 
                key={`items-droppable-${container.id}-${container.items.length}`}
                containerId={container.id}
              >
                <div className="items-list pl-6">
                  {container.items.map(item => (
                    <DraggableItem
                      key={item.id}
                      item={item}
                      containerId={container.id}
                    >
                      <div
                        className="item-row flex items-center py-1 px-2 my-1 cursor-pointer hover:bg-muted rounded-md transition-all duration-300 animate-in fade-in slide-in-from-left-2 hover:scale-[1.02] hover:shadow-sm"
                        onClick={() => onItemClick(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onItemClick(item)}
                        data-drag-handle="false"
                      >
                        <Icon icon="material-symbols:indeterminate-check-box" className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span className="truncate text-sm text-muted-foreground flex-1">{item.itemName}</span>
                        <button
                          className="p-1 rounded-md hover:bg-muted/50 transition-all duration-200 hover:scale-110 ml-2"
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
            </div>
          </DraggableContainer>
        </DroppableContainer>
      </div>
    )
  }

  return (
    <div className="folder-tree">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-start px-3 py-2 mb-2 text-sm"
        onClick={onViewAllItems}
      >
        <Icon icon="material-symbols:indeterminate-check-box" className="h-5 w-5 mr-2" />
        <span>View All Items</span>
      </Button>

      <div className="container-list">
        {containers.map(container => renderContainer(container))}
      </div>

      <LocationInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        container={selectedContainerForModal}
        onEdit={handleEditContainer}
      />
    </div>
  )
}