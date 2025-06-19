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

  // Ajouter ces types à ton fichier types/item.ts existant

export type OrderFormType = 'COMAX_TYPE_A' | 'COMAX_TYPE_B' | 'STANDARD';

export type ComaxPosition = 
  | 'A6' | 'A8' | 'A9' | 'A12' | 'A14S' | 'A13' | 'A17' | 'A15S' | 'A16S'
  | 'A70' | 'A45' | 'A46' | 'A80' | 'A47' | 'A82' | 'A19' | 'A21S' | 'A20'
  | 'A24' | 'A25' | 'A22S' | 'A37S' | 'A87' | 'A23S' | 'A38S' | 'A89'
  | 'A27' | 'A28' | 'A32' | 'A33' | 'A30S' | 'A39S' | 'A91' | 'A31S' | 'A40S' | 'A93';

export interface ComaxTypeAData {
  position: ComaxPosition;
  quantities: {
    length83: number;
    length125: number;
    length240?: number;
  };
  metadata?: {
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface ComaxTypeAArticle extends BaseItem {
  type: 'COMAX_TYPE_A';
  data: ComaxTypeAData;
}

// Étendre ton type Article existant
export type Article = ComaxTypeAArticle | StandardItem; // Ajoute les autres types existants

// Types pour le formulaire
export interface ComaxTypeAFormData {
  position: ComaxPosition | '';
  length83: string;
  length125: string;
  length240?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | '';
}

export interface ComaxTypeAValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof ComaxTypeAFormData, string>>;
}

export interface ComaxTypeAFormProps {
  onValidationChange?: (isValid: boolean) => void;
  onArticleCreate?: (article: ComaxTypeAArticle) => void;
  onCancel?: () => void;
}