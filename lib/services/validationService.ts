// Nouveau fichier: lib/services/validationService.ts

import { ComaxTypeAFormData, ComaxTypeAValidationResult, ComaxPosition } from '@/types/item';

const VALID_COMAX_POSITIONS: ComaxPosition[] = [
  'A6', 'A8', 'A9', 'A12', 'A14S', 'A13', 'A17', 'A15S', 'A16S',
  'A70', 'A45', 'A46', 'A80', 'A47', 'A82', 'A19', 'A21S', 'A20',
  'A24', 'A25', 'A22S', 'A37S', 'A87', 'A23S', 'A38S', 'A89',
  'A27', 'A28', 'A32', 'A33', 'A30S', 'A39S', 'A91', 'A31S', 'A40S', 'A93'
];

export class ValidationService {
  static validateComaxTypeA(formData: ComaxTypeAFormData): ComaxTypeAValidationResult {
    const errors: Partial<Record<keyof ComaxTypeAFormData, string>> = {};

    // Validation de la position
    if (!formData.position) {
      errors.position = 'La position COMAX est requise';
    } else if (!VALID_COMAX_POSITIONS.includes(formData.position as ComaxPosition)) {
      errors.position = 'Position COMAX invalide';
    }

    // Validation des quantités
    const length83 = parseInt(formData.length83, 10);
    const length125 = parseInt(formData.length125, 10);
    const length240 = formData.length240 ? parseInt(formData.length240, 10) : 0;

    if (isNaN(length83) || length83 < 0) {
      errors.length83 = 'Quantité invalide pour longueur 83';
    }

    if (isNaN(length125) || length125 < 0) {
      errors.length125 = 'Quantité invalide pour longueur 125';
    }

    if (formData.length240 && (isNaN(length240) || length240 < 0)) {
      errors.length240 = 'Quantité invalide pour longueur 240';
    }

    // Règle métier: au moins une quantité doit être > 0
    if (length83 === 0 && length125 === 0 && length240 === 0) {
      errors.length83 = 'Au moins une quantité doit être supérieure à 0';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}