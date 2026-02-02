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
    opacity: isDragging ? 0.3 : 1,
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
      ...attributes,
      className: `${childProps.className || ''} cursor-grab active:cursor-grabbing`,
      'data-item-id': item.id,
      onPointerDown: (e: React.PointerEvent) => {
        // Stop propagation to prevent container drag
        e.stopPropagation()
        if (listeners?.onPointerDown) {
          listeners.onPointerDown(e as any)
        }
        if (childProps.onPointerDown) {
          childProps.onPointerDown(e)
        }
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.stopPropagation()
        if (childProps.onMouseDown) {
          childProps.onMouseDown(e)
        }
      },
      onTouchStart: (e: React.TouchEvent) => {
        e.stopPropagation()
        if (childProps.onTouchStart) {
          childProps.onTouchStart(e)
        }
      },
    })
  }

  // For non-table-row items, apply listeners directly to the child element
  if (React.isValidElement(children)) {
    const childProps = (children as React.ReactElement<any>).props || {}
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: (node: HTMLElement | null) => {
        setNodeRef(node)
        if (typeof childProps.ref === 'function') {
          childProps.ref(node)
        } else if (childProps.ref) {
          childProps.ref.current = node
        }
      },
      style: { ...style, ...childProps.style },
      ...attributes,
      className: `${childProps.className || ''} cursor-grab active:cursor-grabbing`,
      'data-item-id': item.id,
      onPointerDown: (e: React.PointerEvent) => {
        // Stop propagation to prevent container drag, but allow item drag
        const target = e.target as HTMLElement
        if (target.closest('button')) {
          e.stopPropagation()
          return
        }
        if (listeners?.onPointerDown) {
          listeners.onPointerDown(e as any)
        }
        if (childProps.onPointerDown) {
          childProps.onPointerDown(e)
        }
      },
      onMouseDown: (e: React.MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('button')) {
          e.stopPropagation()
          return
        }
        if (childProps.onMouseDown) {
          childProps.onMouseDown(e)
        }
      },
      onTouchStart: (e: React.TouchEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('button')) {
          e.stopPropagation()
          return
        }
        if (childProps.onTouchStart) {
          childProps.onTouchStart(e)
        }
      },
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        {children}
      </div>
    </div>
  )
}
