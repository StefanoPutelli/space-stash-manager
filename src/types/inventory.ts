
export interface Tag {
  _id: string;
  name: string;
  color: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  tags: Tag[];
  dateAdded: string;
  addedBy: string;
}

export interface CreateItemData {
  name: string;
  description: string;
  tagIds: string[];
}
