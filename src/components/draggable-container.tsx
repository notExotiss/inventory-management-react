"use client"

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Container } from '@/lib/types'

interface DraggableContainerProps {
  container: Container
  children: React.ReactNode
}

export function DraggableContainer({ container, children }: DraggableContainerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: container.id,
    data: {
      type: 'container',
      container,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  if (React.isValidElement(children)) {
    const childProps = (children as React.ReactElement<any>).props || {}
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: (node: HTMLElement | null) => {
        setNodeRef(node)
        // Also call the original ref if it exists
        if (typeof childProps.ref === 'function') {
          childProps.ref(node)
        } else if (childProps.ref) {
          childProps.ref.current = node
        }
      },
      style: { ...style, ...childProps.style },
      ...attributes,
      className: `${childProps.className || ''} cursor-grab active:cursor-grabbing`,
      onPointerDown: (e: React.PointerEvent) => {
        // Only allow dragging from the folder header, not from items inside
        const target = e.target as HTMLElement
        const isItemRow = target.closest('.item-row')
        const isDragHandleFalse = target.closest('[data-drag-handle="false"]')
        const isFolderHeader = target.closest('.folder-header') || target.closest('[data-drag-handle="true"]')
        
        // Don't drag container if clicking on item or non-draggable area
        if (isItemRow || isDragHandleFalse || !isFolderHeader) {
          return
        }
        
        if (listeners?.onPointerDown) {
          listeners.onPointerDown(e as any)
        }
        if (childProps.onPointerDown) {
          childProps.onPointerDown(e)
        }
      },
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
