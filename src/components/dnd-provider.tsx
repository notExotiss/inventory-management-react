"use client"

import React from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

interface DndProviderWrapperProps {
  children: React.ReactNode
  onDragEnd?: (event: DragEndEvent) => void
}

export function DndProviderWrapper({ children, onDragEnd }: DndProviderWrapperProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || !overData) return

    // Handle item being dropped on container
    if (activeData.type === 'item' && overData.type === 'container') {
      const itemId = active.id as string
      const containerId = over.id as string

      if (activeData.containerId !== containerId) {
        onDragEnd?.(event)
      }
    }

    // Handle container being dropped on container (moving folders)
    if (activeData.type === 'container' && overData.type === 'container') {
      const containerId = active.id as string
      const targetContainerId = over.id as string

      if (containerId !== targetContainerId) {
        onDragEnd?.(event)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  )
}