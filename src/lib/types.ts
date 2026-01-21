export interface Container {
  id: string;
  containerName: string;
  containerLocation: Location;
  items: Item[];
  isExpanded?: boolean;
  children?: Container[];
  parentId?: string | null;
  description?: string;
  image?: string;
}

export interface Item {
  id: string;
  itemName: string;
  itemLocation: Location;
  itemMeasurements?: Measurements;
  description?: string;
  image?: string;
}

export interface Measurements {
  unit: string;
  size: number;
}

export interface Location {
  path: string;
  image?: string;
}

export interface ItemSearchResult {
  item: Item;
  container: Container;
}