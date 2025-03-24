// lib/services/orderListService.ts
import { OrderList, OrderListFormData } from '@/types/orderList';

// Helper function to convert database order list to frontend order list
const mapDbOrderListToOrderList = (dbOrderList: any): OrderList => ({
  id: dbOrderList.id,
  partId: dbOrderList.part_id,
  listNumber: dbOrderList.list_number,
  name: dbOrderList.name,
  manufacturer: dbOrderList.manufacturer,
  type: dbOrderList.type,
  designer: dbOrderList.designer,
  projectManager: dbOrderList.project_manager,
  status: dbOrderList.status,
  submissionDate: dbOrderList.submission_date,
  createdAt: dbOrderList.created_at,
  updatedAt: dbOrderList.updated_at
});

// Order List services
export const orderListService = {
  // Get all order lists for a specific project part
  async getOrderLists(partId: string): Promise<OrderList[]> {
    try {
      console.log('Fetching order lists for partId:', partId);
      const response = await fetch(`/api/order-lists?partId=${partId}`, {
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
        throw new Error(`Failed to fetch order lists: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Order lists data received:', data);
      return data.map(mapDbOrderListToOrderList);
    } catch (error) {
      console.error('Error in getOrderLists:', error);
      throw error;
    }
  },

// Create a new order list
async createOrderList(orderListData: OrderListFormData): Promise<OrderList> {
    try {
      // Convert frontend model to database model format expected by the API
      const apiData = {
        partId: orderListData.partId,
        listNumber: orderListData.listNumber,
        name: orderListData.name,
        manufacturer: orderListData.manufacturer,
        type: orderListData.type,
        designer: orderListData.designer,
        projectManager: orderListData.projectManager,
        status: orderListData.status || 'draft',
        submissionDate: orderListData.submissionDate || null
      };
      
      console.log('Creating order list for partId:', orderListData.partId, 'with data:', apiData);
      
      const response = await fetch('/api/order-lists', {
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
        throw new Error(`Failed to create order list: ${errorMessage}`);
      }
      
      // Parse JSON response
      const responseData = await response.json();
      console.log('Order list created successfully:', responseData);
      return mapDbOrderListToOrderList(responseData);
    } catch (error) {
      console.error('Error in createOrderList:', error);
      throw error;
    }
  },

  // Get a specific order list
  async getOrderList(orderListId: string): Promise<OrderList> {
    try {
      console.log('Fetching order list with ID:', orderListId);
      const response = await fetch(`/api/order-lists/${orderListId}`, {
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
        throw new Error(`Failed to fetch order list: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Order list data received:', data);
      return mapDbOrderListToOrderList(data);
    } catch (error) {
      console.error('Error in getOrderList:', error);
      throw error;
    }
  },

  // Update an order list
  async updateOrderList(orderListId: string, orderListData: Partial<OrderListFormData>): Promise<OrderList> {
    try {
      console.log('Updating order list with ID:', orderListId, 'with data:', orderListData);
      
      const response = await fetch(`/api/order-lists/update/${orderListId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderListData),
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
        throw new Error(`Failed to update order list: ${errorMessage}`);
      }
      
      // Parse JSON response
      const responseData = await response.json();
      console.log('Order list updated successfully:', responseData);
      return mapDbOrderListToOrderList(responseData);
    } catch (error) {
      console.error('Error in updateOrderList:', error);
      throw error;
    }
  },

  // Delete an order list
  async deleteOrderList(orderListId: string): Promise<boolean> {
    try {
      console.log('Deleting order list with ID:', orderListId);
      
      const response = await fetch(`/api/order-lists/remove/${orderListId}`, {
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
        throw new Error(`Failed to delete order list: ${errorMessage}`);
      }
      
      console.log('Order list deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteOrderList:', error);
      throw error;
    }
  },
  
  // Submit an order list - changes status to 'submitted' and sets submission date
  async submitOrderList(orderListId: string): Promise<OrderList> {
    try {
      console.log('Submitting order list with ID:', orderListId);
      
      const data = {
        status: 'submitted',
        submissionDate: new Date().toISOString()
      };
      
      const response = await fetch(`/api/order-lists/update/${orderListId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
        throw new Error(`Failed to submit order list: ${errorMessage}`);
      }
      
      // Parse JSON response
      const responseData = await response.json();
      console.log('Order list submitted successfully:', responseData);
      return mapDbOrderListToOrderList(responseData);
    } catch (error) {
      console.error('Error in submitOrderList:', error);
      throw error;
    }
  }
};