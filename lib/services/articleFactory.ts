// Nouveau fichier: lib/services/articleFactory.ts

import { ComaxTypeAFormData, ComaxTypeAArticle, ComaxPosition } from '@/types/item';
import { v4 as uuidv4 } from 'uuid';

export class ArticleFactory {
  static fromFormData(type: 'COMAX_TYPE_A', formData: ComaxTypeAFormData): ComaxTypeAArticle {
    switch (type) {
      case 'COMAX_TYPE_A':
        return this.createComaxTypeA(formData);
      default:
        throw new Error(`Article factory not implemented for type: ${type}`);
    }
  }

  private static createComaxTypeA(formData: ComaxTypeAFormData): ComaxTypeAArticle {
    const now = new Date().toISOString();
    
    return {
      id: uuidv4(),
      type: 'COMAX_TYPE_A',
      data: {
        position: formData.position as ComaxPosition,
        quantities: {
          length83: parseInt(formData.length83, 10),
          length125: parseInt(formData.length125, 10),
          length240: formData.length240 ? parseInt(formData.length240, 10) : undefined,
        },
        metadata: {
          notes: formData.notes || undefined,
          priority: formData.priority === '' ? undefined : formData.priority as 'low' | 'medium' | 'high',
        },
      },
      createdAt: now,
      updatedAt: now,
      // Ajoute ici les autres champs requis par BaseItem
      name: `COMAX ${formData.position}`,
      description: `Article COMAX Type A - Position ${formData.position}`,
      quantity: parseInt(formData.length83, 10) + parseInt(formData.length125, 10) + (formData.length240 ? parseInt(formData.length240, 10) : 0),
    };
  }
}