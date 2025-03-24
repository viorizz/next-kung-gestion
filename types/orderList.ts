// types/orderList.ts
export type OrderList = {
  id: string;
  partId: string;
  listNumber: string;
  name: string;
  manufacturer: string;
  type: string;
  designer: string;
  projectManager: string;
  status: string;
  submissionDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderListFormData = Omit<OrderList, 'id' | 'createdAt' | 'updatedAt'>;