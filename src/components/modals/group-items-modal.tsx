"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Container, Item } from "@/lib/types"

interface GroupItemsModalProps {
  open: boolean
  onClose: () => void
  onGroup: (locationId: string) => void
  containers: Container[]
  selectedItems: Item[]
}

export function GroupItemsModal({
  open,
  onClose,
  onGroup,
  containers,
  selectedItems
}: GroupItemsModalProps) {
  const [selectedLocation, setSelectedLocation] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedLocation) return

    onGroup(selectedLocation)
    onClose()
  }

  const flattenContainers = (containers: Container[]): { id: string; name: string; path: string }[] => {
    const result: { id: string; name: string; path: string }[] = []

    const traverse = (containers: Container[], prefix = "") => {
      containers.forEach(container => {
        result.push({
          id: container.id,
          name: prefix + container.containerName,
          path: container.containerLocation.path
        })

        if (container.children) {
          traverse(container.children, prefix + "  ")
        }
      })
    }

    traverse(containers)
    return result
  }

  const flattenedContainers = flattenContainers(containers)

  return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] modal-box bg-base-100">
        <DialogHeader>
          <DialogTitle>Group Items</DialogTitle>
          <DialogDescription>
            Move {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''} to a new location.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <Label>Select destination location:</Label>
              <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation}>
                {flattenedContainers.map((container) => (
                  <div key={container.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={container.id} id={container.id} />
                    <Label htmlFor={container.id} className="flex-1 cursor-pointer">
                      {container.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedLocation}>
              Move Items
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}