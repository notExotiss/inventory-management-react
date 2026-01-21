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
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
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
