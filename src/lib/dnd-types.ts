export const ItemTypes = {
  ITEM: 'item',
  CONTAINER: 'container'
} as const

export type DragItem = {
  type: typeof ItemTypes.ITEM
  id: string
  itemName: string
  containerId: string
}

export type DragContainer = {
  type: typeof ItemTypes.CONTAINER
  id: string
  containerName: string
  parentId?: string
}