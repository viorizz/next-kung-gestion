// lib/services/itemService.ts
import { Item } from '@/types/item';

// Helper function to convert database item to frontend item
const mapDbItemToItem = (dbItem: any): Item => ({
  id: dbItem.id,
  orderListId: dbItem.order_list_id,
  position: dbItem.position,
  article: dbItem.article,
  quantity: dbItem.quantity,
  type: dbItem.type,
  specifications: dbItem.specifications || {},
  createdAt: dbItem.created_at,
  updatedAt: dbItem.updated_at
});

// Item services
export const itemService = {
  // Get all items for a specific order list
  async getItems(orderListId: string): Promise<Item[]> {
    try {
      console.log('Fetching items for orderListId:', orderListId);
      const response = await fetch(`/api/items?orderListId=${orderListId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to fetch items: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Items data received:', data);
      return data.map(mapDbItemToItem);
    } catch (error) {
      console.error('Error in getItems:', error);
      throw error;
    }
  },

  // Create a new item
  async createItem(itemData: Partial<Item>): Promise<Item> {
    try {
      // Convert frontend model to database model format expected by the API
      const apiData = {
        orderListId: itemData.orderListId,
        position: itemData.position,
        article: itemData.article,
        quantity: itemData.quantity || 1,
        type: itemData.type,
        specifications: itemData.specifications || {}
      };
      
      console.log('Creating item for orderList:', itemData.orderListId, 'with data:', apiData);
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to create item: ${errorMessage}`);
      }
      
      // Parse JSON response
      const responseData = await response.json();
      console.log('Item created successfully:', responseData);
      return mapDbItemToItem(responseData);
    } catch (error) {
      console.error('Error in createItem:', error);
      throw error;
    }
  },

  // Get a specific item
  async getItem(itemId: string): Promise<Item> {
    try {
      console.log('Fetching item with ID:', itemId);
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to fetch item: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Item data received:', data);
      return mapDbItemToItem(data);
    } catch (error) {
      console.error('Error in getItem:', error);
      throw error;
    }
  },

  // Update an item
  async updateItem(itemId: string, itemData: Partial<Item>): Promise<Item> {
    try {
      console.log('Updating item with ID:', itemId, 'with data:', itemData);
      
      const response = await fetch(`/api/items/update/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to update item: ${errorMessage}`);
      }
      
      // Parse JSON response
      const responseData = await response.json();
      console.log('Item updated successfully:', responseData);
      return mapDbItemToItem(responseData);
    } catch (error) {
      console.error('Error in updateItem:', error);
      throw error;
    }
  },

  // Delete an item
  async deleteItem(itemId: string): Promise<boolean> {
    try {
      console.log('Deleting item with ID:', itemId);
      
      const response = await fetch(`/api/items/remove/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to delete item: ${errorMessage}`);
      }
      
      console.log('Item deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteItem:', error);
      throw error;
    }
  },
  
  // Reorder items by updating their positions
  async reorderItems(orderListId: string, itemIds: string[]): Promise<boolean> {
    try {
      console.log('Reordering items for order list:', orderListId);
      
      const response = await fetch(`/api/items/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderListId,
          itemIds
        }),
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to reorder items: ${errorMessage}`);
      }
      
      console.log('Items reordered successfully');
      return true;
    } catch (error) {
      console.error('Error in reorderItems:', error);
      throw error;
    }
  }
};