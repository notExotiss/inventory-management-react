"use client"

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface DroppableContainerProps {
  containerId: string
  children: React.ReactNode
  className?: string
}

export function DroppableContainer({
  containerId,
  children,
  className
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
    },
  })

  const isValidDrop = active?.data?.current?.containerId !== containerId

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && isValidDrop && "bg-primary/10 border-primary border-dashed",
        isOver && !isValidDrop && "bg-destructive/10 border-destructive border-dashed"
      )}
    >
      {children}
    </div>
  )
}