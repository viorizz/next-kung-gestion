  // types/item.ts
  export type Item = {
    id: string;
    orderListId: string;
    position: number;
    article: string;
    quantity: number;
    type: string;
    specifications: any; // Or define a more specific type for your specifications
    createdAt: string;
    updatedAt: string;
  };
  
  export type ItemFormData = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;