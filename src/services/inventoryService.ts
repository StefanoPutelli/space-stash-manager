
/*  Inventory API service  */

import {
  InventoryItem,
  Tag,
  CreateItemData,
  UpdateItemData,
} from '@/types/inventory';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:6789/api';

// ⬇️ helper per recuperare il token JWT dal localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('hackerspace_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const inventoryService = {
  async getItems(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_URL}/items`);
    if (!res.ok) throw new Error('Impossibile scaricare gli item');
    return res.json();
  },

  async getTags(): Promise<Tag[]> {
    const res = await fetch(`${API_URL}/tags`);
    if (!res.ok) throw new Error('Impossibile scaricare i tag');
    return res.json();
  },

  async createItem(data: CreateItemData): Promise<InventoryItem> {
    const res = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const msg = (await res.json())?.message ?? 'Errore creazione item';
      throw new Error(msg);
    }
    return res.json();
  },

  async updateItem(itemId: string, data: UpdateItemData): Promise<InventoryItem> {
    const res = await fetch(`${API_URL}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const msg = (await res.json())?.message ?? 'Errore aggiornamento item';
      throw new Error(msg);
    }
    return res.json();
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<InventoryItem> {
    const res = await fetch(`${API_URL}/items/${itemId}/quantity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ quantity }),
    });

    if (!res.ok) {
      const msg = (await res.json())?.message ?? 'Errore aggiornamento quantità';
      throw new Error(msg);
    }
    return res.json();
  },

  async updateUsedItemQuantity(itemId: string, quantity: number): Promise<InventoryItem> {
    const res = await fetch(`${API_URL}/items/${itemId}/usedquantity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ quantity }),
    });

    if (!res.ok) {
      const msg = (await res.json())?.message ?? 'Errore aggiornamento quantità usata';
      throw new Error(msg);
    }
    return res.json();
  },

  async deleteItem(itemId: string): Promise<void> {
    const res = await fetch(`${API_URL}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      const msg = (await res.json())?.message ?? 'Errore eliminazione item';
      throw new Error(msg);
    }
  },

  async createTag(name: string, color: string): Promise<Tag> {
    const res = await fetch(`${API_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ name, color }),
    });

    if (!res.ok) {
      const msg = (await res.json())?.message ?? 'Errore creazione tag';
      throw new Error(msg);
    }
    return res.json();
  },

  async deleteTag(tagId: string): Promise<void> {
    const res = await fetch(`${API_URL}/tags/${tagId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      const msg = (await res.json())?.message ?? 'Errore eliminazione tag';
      throw new Error(msg);
    }
  },

  async searchItems(query = '', tagIds: string[] = []): Promise<InventoryItem[]> {
    const qs = new URLSearchParams({
      query,
      tagIds: tagIds.join(','),
    });
    const res = await fetch(`${API_URL}/items/search?${qs.toString()}`);
    if (!res.ok) throw new Error('Errore ricerca item');
    return res.json();
  },
};
