"use client"

import * as React from "react"
import { Trash2, FolderPlus, Plus, FolderUp, HelpCircle, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { SearchBar } from "./search-bar"

interface MobileHeaderProps {
  searchQuery: string
  selectedItems: string[]
  onSearchChange: (value: string) => void
  onClearSelection: () => void
  onDelete: () => void
  onGroupIntoLocation: () => void
  onAddItem: () => void
  onAddLocation: () => void
  onShowHelp: () => void
  onUndo: () => void
  canUndo: boolean
}

export function MobileHeader({
  searchQuery,
  selectedItems,
  onSearchChange,
  onClearSelection,
  onDelete,
  onGroupIntoLocation,
  onAddItem,
  onAddLocation,
  onShowHelp,
  onUndo,
  canUndo
}: MobileHeaderProps) {
  const logo = '/2554_logo.png'

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm backdrop-blur-none">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 gap-3">
        {/* Logo and Title */}
        <div className="flex items-center flex-1 min-w-0">
          <img
            src={logo}
            alt="Team 2554 Logo"
            className="h-8 w-auto mr-2 flex-shrink-0"
          />
          <h1 className="text-lg font-semibold truncate">Inventory</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={onShowHelp}
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full"
        />
      </div>

      {/* Selection Actions or Add Buttons */}
      {selectedItems.length > 0 ? (
        <div className="px-4 pb-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground flex-1">
            {selectedItems.length} Selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onGroupIntoLocation}
            className="flex items-center gap-1"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Group</span>
          </Button>
        </div>
      ) : (
        <div className="px-4 pb-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddItem}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddLocation}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <FolderUp className="h-4 w-4" />
            <span>Add Location</span>
          </Button>
        </div>
      )}
    </header>
  )
}
