"use client"

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
} from '@dnd-kit/core'

interface DndProviderWrapperProps {
  children: React.ReactNode
  onDragEnd?: (event: DragEndEvent) => void
}

export function DndProviderWrapper({ children, onDragEnd }: DndProviderWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeData, setActiveData] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Use both PointerSensor (desktop) and TouchSensor (mobile)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setActiveData(event.active.data.current)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    setActiveData(null)

    const { active, over } = event

    if (!over) {
      return
    }

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || !overData) {
      return
    }

    // Always call the parent handler - let it decide what to do
    onDragEnd?.(event)
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setActiveData(null)
  }

  // Prevent hydration mismatch by only rendering DndContext on client
  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null} style={{ cursor: 'grabbing' }}>
        {activeId && activeData ? (
          <div className="opacity-95 shadow-2xl">
            {activeData.type === 'item' ? (
              <div className="bg-background border-2 border-primary rounded-md px-3 py-2 shadow-lg">
                <span className="text-sm font-medium whitespace-nowrap">{activeData.item?.itemName || 'Item'}</span>
              </div>
            ) : activeData.type === 'container' ? (
              <div className="bg-background border-2 border-primary rounded-md px-3 py-2 shadow-lg flex items-center gap-2">
                <span className="text-sm font-medium whitespace-nowrap">{activeData.container?.containerName || 'Folder'}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
