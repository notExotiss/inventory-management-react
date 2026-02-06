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
import { Item } from "@/lib/types"
import { getPlaceholderImage } from "@/lib/utils"

interface PhotoViewModalProps {
  open: boolean
  onClose: () => void
  item: Item | null
}

export function PhotoViewModal({ open, onClose, item }: PhotoViewModalProps) {
  if (!item) return null

  const imageSrc = item.image || getPlaceholderImage('item', item.itemName)

  return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <DialogTitle>{item.itemName}</DialogTitle>
          <DialogDescription>
            Photo view
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <img
            src={imageSrc}
            alt={item.itemName}
            className="max-w-full max-h-96 object-contain rounded-md"
          />
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Location:</span>
            <span>{item.itemLocation.path}</span>
          </div>

          {item.itemMeasurements && (
            <div className="flex justify-between">
              <span className="font-medium">Measurements:</span>
              <span>{item.itemMeasurements.size} {item.itemMeasurements.unit}</span>
            </div>
          )}

          {item.description && (
            <div className="space-y-1">
              <span className="font-medium">Description:</span>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}