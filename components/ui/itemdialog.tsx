'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Item } from '@/types/item';

// Field configuration for focusing
const fieldOrder = [
  'article',
  'quantity',
  'type',
  'specifications',
];

// Sample product types for different manufacturers
// In a real application, these would come from a database
const productTypes = {
  'ancotech': ['COMAX-Typ-A', 'COMAX-Typ-B', 'COMAX-Typ-C'],
  'debrunner': ['Console Acinox', 'Detan Rod System', 'Halfen HIT'],
  'halfen': ['Halfen HTA', 'Halfen HZA', 'Halfen HSC'],
  'hilti': ['HIT Elements', 'Hilti KB-TZ', 'Hilti HAC']
};

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Item | Partial<Item>) => void;
  item?: Item;
  orderListId: string;
  manufacturer: string;
  productType: string;
}

export function ItemDialog({
  open,
  onOpenChange,
  onSave,
  item,
  orderListId,
  manufacturer,
  productType
}: ItemDialogProps) {
  const isEditing = !!item;

  // Create refs for each input field
  const inputRefs = {
    article: useRef<HTMLInputElement>(null),
    quantity: useRef<HTMLInputElement>(null),
    type: useRef<HTMLInputElement>(null),
    specifications: useRef<HTMLTextAreaElement>(null),
  };

  const [formData, setFormData] = useState<Omit<Item, 'id' | 'orderListId' | 'position' | 'createdAt' | 'updatedAt'>>({
    article: '',
    quantity: 1,
    type: '',
    specifications: {}
  });

  // Reset form when dialog opens/closes or item changes
  useEffect(() => {
    if (item) {
      console.log('Setting form data from item:', item);
      setFormData({
        article: item.article,
        quantity: item.quantity,
        type: item.type,
        specifications: item.specifications || {}
      });
    } else if (open) {
      // Reset form when opening for a new item
      // Pre-fill with product type from order list
      setFormData({
        article: '',
        quantity: 1,
        type: productType,
        specifications: {}
      });
    }
  }, [item, open, productType]);

  // Focus the first field when the dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the dialog is fully rendered
      setTimeout(() => {
        inputRefs.article.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'quantity') {
      // Ensure quantity is always a number
      const numValue = parseInt(value, 10) || 1;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'specifications') {
      // Try to parse specifications as JSON, or store as a string
      try {
        // If the user enters valid JSON, parse it
        const jsonValue = JSON.parse(value);
        setFormData(prev => ({ ...prev, [name]: jsonValue }));
      } catch {
        // If not valid JSON, store as a string in a specifications object
        setFormData(prev => ({ ...prev, [name]: { text: value } }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle tab and enter key to move between fields
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault(); // Prevent default tab behavior

      // Find the current field index
      const currentIndex = fieldOrder.indexOf(fieldName);

      // Determine the next field index
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + fieldOrder.length) % fieldOrder.length // Go backwards with Shift+Tab
        : (currentIndex + 1) % fieldOrder.length; // Go forwards with Tab

      const nextField = fieldOrder[nextIndex];

      // Focus the next field
      inputRefs[nextField as keyof typeof inputRefs].current?.focus();
    }
  };

  // Format specifications for display
  const formatSpecificationsForDisplay = (specs: any): string => {
    if (!specs) return '';
    
    // If it's a string already, return it
    if (typeof specs === 'string') return specs;
    
    // If it has a text property, use that
    if (specs.text) return specs.text;
    
    // Otherwise, format it as JSON
    try {
      return JSON.stringify(specs, null, 2);
    } catch {
      return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    // Add the orderListId to the form data if creating a new item
    const completeFormData = isEditing
      ? { ...formData }
      : { ...formData, orderListId };

    if (isEditing && item) {
      console.log('Updating item with ID:', item.id);
      onSave({ id: item.id, ...completeFormData });
    } else {
      console.log('Creating new item for order list ID:', orderListId);
      onSave(completeFormData);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Item` : 'Add New Item'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="article">Article*</Label>
            <Input
              id="article"
              name="article"
              value={formData.article}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'article')}
              ref={inputRefs.article}
              required
              placeholder="e.g. HTA-40/22"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity*</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'quantity')}
              ref={inputRefs.quantity}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type*</Label>
            <Input
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'type')}
              ref={inputRefs.type}
              required
              placeholder="e.g. Halfen HTA Profile"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specifications">Specifications</Label>
            <Textarea
              id="specifications"
              name="specifications"
              value={formatSpecificationsForDisplay(formData.specifications)}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'specifications')}
              ref={inputRefs.specifications}
              placeholder="Enter additional specifications for this item"
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Enter specifications as plain text, or as a JSON object for structured data.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}