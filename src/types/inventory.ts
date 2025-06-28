
export interface Tag {
  _id: string;
  name: string;
  color: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  tags: Tag[];
  dateAdded: string;
  addedBy: string;
}

export interface CreateItemData {
  name: string;
  description: string;
  quantity: number;
  tagIds: string[];
}

export interface UpdateItemData {
  name?: string;
  description?: string;
  quantity?: number;
  tagIds?: string[];
}
