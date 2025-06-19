// Nouveau fichier: components/forms/ComaxTypeAForm.tsx

'use client';

import React from 'react';
import { ComaxTypeAFormProps } from '@/types/item';
import { useComaxTypeAForm } from '@/hooks/useComaxTypeAForm';

const COMAX_POSITIONS = [
  'A6', 'A8', 'A9', 'A12', 'A14S', 'A13', 'A17', 'A15S', 'A16S',
  'A70', 'A45', 'A46', 'A80', 'A47', 'A82', 'A19', 'A21S', 'A20',
  'A24', 'A25', 'A22S', 'A37S', 'A87', 'A23S', 'A38S', 'A89',
  'A27', 'A28', 'A32', 'A33', 'A30S', 'A39S', 'A91', 'A31S', 'A40S', 'A93'
];

export const ComaxTypeAForm: React.FC<ComaxTypeAFormProps> = ({
  onValidationChange,
  onArticleCreate,
  onCancel,
}) => {
  const {
    formData,
    errors,
    isFormValid,
    updateField,
    createArticle,
    reset,
  } = useComaxTypeAForm();

  React.useEffect(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  const handleSubmit = () => {
    const article = createArticle();
    if (article) {
      onArticleCreate?.(article);
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold text-gray-900">
        Nouvel article COMAX Type A
      </div>

      {/* Position COMAX */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position COMAX *
        </label>
        <select
          value={formData.position}
          onChange={(e) => updateField('position', e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.position ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Sélectionner une position</option>
          {COMAX_POSITIONS.map(position => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
        {errors.position && (
          <p className="text-red-500 text-sm mt-1">{errors.position}</p>
        )}
      </div>

      {/* Quantités */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantités *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Longueur 83 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Longueur 83
            </label>
            <input
              type="number"
              min="0"
              value={formData.length83}
              onChange={(e) => updateField('length83', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.length83 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
          </div>

          {/* Longueur 125 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Longueur 125
            </label>
            <input
              type="number"
              min="0"
              value={formData.length125}
              onChange={(e) => updateField('length125', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.length125 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
          </div>

          {/* Longueur 240 */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Longueur 240 (optionnel)
            </label>
            <input
              type="number"
              min="0"
              value={formData.length240 || ''}
              onChange={(e) => updateField('length240', e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.length240 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
          </div>
        </div>
        {(errors.length83 || errors.length125 || errors.length240) && (
          <p className="text-red-500 text-sm mt-1">
            {errors.length83 || errors.length125 || errors.length240}
          </p>
        )}
      </div>

      {/* Priorité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priorité
        </label>
        <select
          value={formData.priority || ''}
          onChange={(e) => updateField('priority', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Sélectionner une priorité</option>
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Notes supplémentaires..."
        />
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            isFormValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Ajouter l'article
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};