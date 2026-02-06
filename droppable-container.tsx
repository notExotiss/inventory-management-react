"use client"

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Container } from '@/lib/types'

interface DroppableContainerProps {
  containerId: string
  children: React.ReactNode
  className?: string
  container?: Container
}

export function DroppableContainer({
  containerId,
  children,
  className,
  container
}: DroppableContainerProps) {
  const {
    setNodeRef,
    isOver,
    active,
  } = useDroppable({
    id: containerId,
    data: {
      type: 'container',
      containerId,
      container, // Include the container object for easier lookup
    },
  })

  const activeData = active?.data?.current
  
  // Check if this is a valid drop target
  const isValidItemDrop = activeData?.type === 'item' && activeData?.containerId !== containerId
  const isValidContainerDrop = activeData?.type === 'container' && active?.id !== containerId
  
  const isValidDrop = isValidItemDrop || isValidContainerDrop

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        "min-h-[20px] transition-all duration-150 rounded-md",
        isOver && isValidItemDrop && "bg-primary/20 border-primary border-2 border-dashed p-2 ring-2 ring-primary/30",
        isOver && !isValidItemDrop && activeData?.type === 'item' && "bg-destructive/20 border-destructive border-2 border-dashed p-2",
        isOver && isValidContainerDrop && "bg-blue-500/20 border-blue-500 border-2 border-dashed p-2 ring-2 ring-blue-500/30",
        isOver && !isValidContainerDrop && activeData?.type === 'container' && "bg-destructive/20 border-destructive border-2 border-dashed p-2"
      )}
    >
      {children}
    </div>
  )
}