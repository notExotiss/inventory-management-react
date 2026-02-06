"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Help & Instructions</DialogTitle>
          <DialogDescription>
            A guide for how to use the Inventory Management System
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Select a location from the sidebar to view its contents</li>
              <li>Use the search bar to find items quickly</li>
              <li>Click "Add Item" to create new inventory items</li>
              <li>Click "Add Location" to create new storage locations</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Managing Items</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Select items using the checkboxes</li>
              <li>Use "Delete" to remove selected items</li>
              <li>Use "Group" to move items to different locations</li>
              <li>Click on any item to view/edit its details</li>
              <li>To add a similar item, click on the location you want to add it to first and then proceed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> - Open item details</li>
              <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> - Select item</li>
              <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd> - Navigate between elements</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Got it!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}