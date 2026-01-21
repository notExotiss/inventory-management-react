"use client"

import * as React from "react"
import { Trash2, FolderPlus, Plus, FolderUp, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { SearchBar } from "./search-bar"

interface HeaderProps {
  searchQuery: string
  selectedItems: string[]
  onSearchChange: (value: string) => void
  onClearSelection: () => void
  onDelete: () => void
  onGroupIntoLocation: () => void
  onAddItem: () => void
  onAddLocation: () => void
  onShowHelp: () => void
}

export function Header({
  searchQuery,
  selectedItems,
  onSearchChange,
  onClearSelection,
  onDelete,
  onGroupIntoLocation,
  onAddItem,
  onAddLocation,
  onShowHelp
}: HeaderProps) {
  const logo = '/2554_logo.png'

  return (
    <header className="sticky top-0 z-50 w-full flex items-center px-4 py-3 shadow-lg bg-base-100 border-b border-base-300">
      {/* Left: Logo and Title */}
      <div className="flex items-center">
        <img
          src={logo}
          alt="Team 2554 Logo"
          className="h-9 w-auto mr-3"
        />
        <h1 className="text-xl font-semibold hidden sm:block">Team 2554 Inventory Management</h1>
        <h1 className="text-xl font-semibold sm:hidden">Inventory</h1>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-64">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            className="header-search-input w-full"
          />
        </div>
      </div>

      {/* Right: Buttons */}
      <div className="flex items-center gap-2">
        {selectedItems.length > 0 ? (
          <>
            {/* Selection Actions */}
            <span className="mr-1 text-sm">{selectedItems.length} Selected</span>
                  <Button
                    className="btn btn-error btn-sm"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                  <Button
                    className="btn btn-outline btn-sm"
                    onClick={onGroupIntoLocation}
                  >
                    <FolderPlus className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Group</span>
                  </Button>
          </>
        ) : (
          <>
            {/* Normal Buttons */}
                  <Button
                    className="btn btn-outline btn-sm"
                    onClick={onAddItem}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Add Item</span>
                  </Button>
                  <Button
                    className="btn btn-outline btn-sm"
                    onClick={onAddLocation}
                  >
                    <FolderUp className="h-4 w-4 mr-1" />
                    <span>Add Location</span>
                  </Button>
          </>
        )}
              <Button
                className="btn btn-ghost btn-sm"
                onClick={onShowHelp}
                aria-label="Help"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}