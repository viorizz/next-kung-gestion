// Nouveau fichier: hooks/useComaxTypeAForm.ts

import { useState, useCallback, useEffect } from 'react';
import { ComaxTypeAFormData, ComaxTypeAValidationResult, ComaxTypeAArticle } from '@/types/item';
import { ValidationService } from '@/lib/services/validationService';
import { ArticleFactory } from '@/lib/services/articleFactory';

const initialFormData: ComaxTypeAFormData = {
  position: '',
  length83: '0',
  length125: '0',
  length240: '0',
  notes: '',
  priority: '',
};

export const useComaxTypeAForm = () => {
  const [formData, setFormData] = useState<ComaxTypeAFormData>(initialFormData);
  const [validationResult, setValidationResult] = useState<ComaxTypeAValidationResult>({
    isValid: false,
    errors: {},
  });

  const updateField = useCallback((field: keyof ComaxTypeAFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validate = useCallback(() => {
    const result = ValidationService.validateComaxTypeA(formData);
    setValidationResult(result);
    return result.isValid;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setValidationResult({ isValid: false, errors: {} });
  }, []);

  const createArticle = useCallback((): ComaxTypeAArticle | null => {
    if (validate()) {
      return ArticleFactory.fromFormData('COMAX_TYPE_A', formData);
    }
    return null;
  }, [formData, validate]);

  const isFormValid = validationResult.isValid;

  // Auto-validation sur changement
  useEffect(() => {
    validate();
  }, [formData, validate]);

  return {
    formData,
    errors: validationResult.errors,
    isFormValid,
    updateField,
    validate,
    reset,
    createArticle,
  };
};