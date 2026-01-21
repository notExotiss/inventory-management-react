"use client"

import * as React from "react"
import { Check, ChevronDown, ChevronUp, Minus } from "lucide-react"
import * as Table from "@/components/ui/table"
import { Item } from "@/lib/types"
import { cn, getPlaceholderImage } from "@/lib/utils"
import { DraggableItem } from "./draggable-item"
import { Icon } from "@iconify/react"

interface InventoryTableProps {
  items: Item[]
  selectedItems: string[]
  containerId?: string
  onSelectItems: (itemIds: string[]) => void
  onViewItem: (item: Item) => void
  onViewPhoto: (item: Item) => void
}

type SortColumn = 'itemName' | 'location' | 'measurement'
type SortDirection = 'asc' | 'desc'

export function InventoryTable({
  items,
  selectedItems,
  containerId,
  onSelectItems,
  onViewItem,
  onViewPhoto
}: InventoryTableProps) {
  const [sortColumn, setSortColumn] = React.useState<SortColumn>('itemName')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc')

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

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

  const handleRowClick = (item: Item) => {
    onViewItem(item)
  }

  const handleKeyDown = (e: React.KeyboardEvent, item: Item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onViewItem(item)
    }
  }

  const handlePhotoClick = (item: Item, event: React.MouseEvent) => {
    event.stopPropagation()
    onViewPhoto(item)
  }

  const handlePhotoKeyDown = (e: React.KeyboardEvent, item: Item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onViewPhoto(item)
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

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      let valueA: any, valueB: any

      switch (sortColumn) {
        case 'itemName':
          valueA = a.itemName
          valueB = b.itemName
          break
        case 'location':
          valueA = a.itemLocation.path
          valueB = b.itemLocation.path
          break
        case 'measurement':
          valueA = a.itemMeasurements?.size || 0
          valueB = b.itemMeasurements?.size || 0
          break
        default:
          return 0
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [items, sortColumn, sortDirection])

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
  }

  const allChecked = items.length > 0 && selectedItems.length === items.length
  const indeterminate = selectedItems.length > 0 && selectedItems.length < items.length

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
      <Table.Table>
        <Table.TableHeader className="bg-muted/50">
          <Table.TableRow>
            <Table.TableHead className="w-16 pl-4 pr-2">
              <button
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-sm border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm",
                  allChecked && "bg-primary text-primary-foreground",
                  indeterminate && "bg-primary text-primary-foreground"
                )}
                onClick={handleSelectAll}
                aria-label="Select all items"
              >
                {allChecked ? (
                  <Icon icon="material-symbols:check" className="h-4 w-4" />
                ) : indeterminate ? (
                  <Icon icon="material-symbols:horizontal-rule" className="h-4 w-4" />
                ) : null}
              </button>
            </Table.TableHead>
            <Table.TableHead
              className="font-medium cursor-pointer"
              onClick={() => handleSort('itemName')}
            >
              <div className="flex items-center">
                Item
                {getSortIcon('itemName')}
              </div>
            </Table.TableHead>
            <Table.TableHead
              className="font-medium cursor-pointer"
              onClick={() => handleSort('location')}
            >
              <div className="flex items-center">
                <Icon icon="material-symbols:location-on" className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                Location
                {getSortIcon('location')}
              </div>
            </Table.TableHead>
            <Table.TableHead
              className="font-medium cursor-pointer w-[100px]"
              onClick={() => handleSort('measurement')}
            >
              <div className="flex items-center">
                <Icon icon="material-symbols:tag" className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                {getSortIcon('measurement')}
              </div>
            </Table.TableHead>
            <Table.TableHead className="w-20">
              Photo
            </Table.TableHead>
            <Table.TableHead className="w-16">
              Info
            </Table.TableHead>
          </Table.TableRow>
        </Table.TableHeader>
        <Table.TableBody>
          {sortedItems.length === 0 ? (
            <Table.TableRow>
              <Table.TableCell className="h-24 text-center text-muted-foreground" colSpan={6}>
                No items found.
              </Table.TableCell>
            </Table.TableRow>
          ) : (
            sortedItems.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                containerId={containerId || ''}
                asTableRow={true}
              >
                <Table.TableRow
                  className="hover cursor-pointer transition-all duration-200"
                  onClick={() => handleRowClick(item)}
                  onKeyDown={(e) => handleKeyDown(e, item)}
                  tabIndex={0}
                  role="button"
                >
                <Table.TableCell className="pl-4 pr-2 py-3">
                  <div onClick={(e) => e.stopPropagation()}>
                    <button
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-sm border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors",
                        selectedItems.includes(item.id) && "bg-primary text-primary-foreground"
                      )}
                      onClick={(e) => handleSelectItem(item.id, e)}
                      aria-label={`Select ${item.itemName}`}
                    >
                      {selectedItems.includes(item.id) && (
                        <Icon icon="material-symbols:check" className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Table.TableCell>
                <Table.TableCell className="px-4 py-3 font-medium">{item.itemName}</Table.TableCell>
                <Table.TableCell className="px-4 py-3 text-muted-foreground">{item.itemLocation.path}</Table.TableCell>
                <Table.TableCell className="px-4 py-3">
                  {item.itemMeasurements && (
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="material-symbols:tag" className="w-4 h-4 text-muted-foreground" />
                      {item.itemMeasurements.size} {item.itemMeasurements.unit}
                    </span>
                  )}
                </Table.TableCell>
                <Table.TableCell className="px-4 py-3">
                  <div
                    className="relative w-12 h-12 overflow-hidden rounded-md border-2 border-border cursor-pointer hover:border-primary transition-all duration-200 hover:scale-105"
                    onClick={(e) => handlePhotoClick(item, e)}
                    onKeyDown={(e) => handlePhotoKeyDown(e, item)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View photo for ${item.itemName}`}
                  >
                    <img
                      src={getItemImage(item)}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                </Table.TableCell>
                <Table.TableCell className="px-4 py-3">
                  <button
                    className="p-1.5 rounded-md hover:bg-muted transition-all duration-200 hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewItem(item)
                    }}
                    aria-label={`View details for ${item.itemName}`}
                  >
                    <Icon icon="material-symbols:info-outline" className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  </button>
                </Table.TableCell>
                </Table.TableRow>
              </DraggableItem>
            ))
          )}
        </Table.TableBody>
      </Table.Table>
    </div>
  )
}