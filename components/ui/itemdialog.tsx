// Modifiez votre fichier components/ui/itemdialog.tsx existant

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ComaxTypeAForm } from '@/components/forms/ComaxTypeAForm';
import { OrderFormType, Article } from '@/types/item';

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleAdded: (article: Article) => void;
  orderFormType?: OrderFormType; // Nouveau prop pour déterminer le type de formulaire
}

export const ItemDialog: React.FC<ItemDialogProps> = ({
  isOpen,
  onClose,
  onArticleAdded,
  orderFormType = 'STANDARD', // Valeur par défaut
}) => {
  const [isFormValid, setIsFormValid] = useState(false);

  const handleArticleCreate = (article: Article) => {
    onArticleAdded(article);
    onClose();
  };

  const renderForm = () => {
    switch (orderFormType) {
      case 'COMAX_TYPE_A':
        return (
          <ComaxTypeAForm
            onValidationChange={setIsFormValid}
            onArticleCreate={handleArticleCreate}
            onCancel={onClose}
          />
        );
      case 'STANDARD':
      default:
        // Garder votre formulaire existant
        return <YourExistingStandardForm />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Ajouter un article
            {orderFormType === 'COMAX_TYPE_A' && ' - COMAX Type A'}
          </DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};