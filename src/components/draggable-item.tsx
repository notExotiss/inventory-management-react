"use client"

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Item } from '@/lib/types'

interface DraggableItemProps {
  item: Item
  containerId: string
  children: React.ReactNode
  asTableRow?: boolean
}

export function DraggableItem({ item, containerId, children, asTableRow = false }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
    data: {
      type: 'item',
      item,
      containerId,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  // For table rows, we need to clone the child and add draggable props
  if (asTableRow && React.isValidElement(children)) {
    const childProps = (children as React.ReactElement<any>).props || {}
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: (node: HTMLTableRowElement | null) => {
        setNodeRef(node)
        // Also call the original ref if it exists
        if (typeof childProps.ref === 'function') {
          childProps.ref(node)
        } else if (childProps.ref) {
          childProps.ref.current = node
        }
      },
      style: { ...style, ...childProps.style },
      ...listeners,
      ...attributes,
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}