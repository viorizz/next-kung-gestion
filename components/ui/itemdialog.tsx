// components/ui/itemdialog.tsx
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
import { getFormMapping } from '@/lib/pdf/formMapping';

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
  
  // Get dynamic fields from PDF mapping
  const [dynamicFields, setDynamicFields] = useState<Array<{pdfField: string, field: string}>>([]);
  
  // Create refs for standard fields
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({
    article: null,
    quantity: null,
    type: null
  });
  
  // Create state for form data
  const [formData, setFormData] = useState<Record<string, any>>({
    article: '',
    quantity: 1,
    type: '',
    specifications: {}
  });

  // Load dynamic fields based on manufacturer and product type
  useEffect(() => {
    if (manufacturer && productType) {
      try {
        // Get mapping for this manufacturer and product type
        const mapping = getFormMapping(manufacturer, productType);
        
        // Extract item-specific fields
        const itemFields = Object.entries(mapping)
          .filter(([_, config]) => config.source === 'item')
          .map(([pdfField, config]) => ({
            pdfField,
            field: config.field
          }));
        
        setDynamicFields(itemFields);
        
        // Initialize refs for dynamic fields
        itemFields.forEach(({ field }) => {
          inputRefs.current[field] = null;
        });
        
      } catch (error) {
        console.error('Error loading dynamic fields:', error);
      }
    }
  }, [manufacturer, productType]);

  // Reset form when dialog opens/closes or item changes
  useEffect(() => {
    if (item) {
      // Initialize form with item data
      const initialData = {
        article: item.article,
        quantity: item.quantity,
        type: item.type,
      };
      
      // Add any specification fields that match our dynamic fields
      if (item.specifications && typeof item.specifications === 'object') {
        dynamicFields.forEach(({ field }) => {
          if (item.specifications[field] !== undefined) {
            initialData[field] = item.specifications[field];
          }
        });
      }
      
      // Keep any other specifications that don't match dynamic fields
      const otherSpecs = { ...item.specifications };
      dynamicFields.forEach(({ field }) => {
        delete otherSpecs[field];
      });
      
      initialData.specifications = otherSpecs;
      
      setFormData(initialData);
    } else if (open) {
      // Initialize form for new item
      const initialData = {
        article: '',
        quantity: 1,
        type: productType,
        specifications: {}
      };
      
      // Initialize dynamic fields with empty values
      dynamicFields.forEach(({ field }) => {
        initialData[field] = '';
      });
      
      setFormData(initialData);
    }
  }, [item, open, productType, dynamicFields]);

  // Focus the first field when the dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the dialog is fully rendered
      setTimeout(() => {
        if (inputRefs.current.article) {
          (inputRefs.current.article as HTMLInputElement).focus();
        }
      }, 100);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'quantity') {
      // Ensure quantity is always a number
      const numValue = parseInt(value, 10) || 1;
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Generate a list of all field names for keyboard navigation
  const getAllFields = () => {
    const standardFields = ['article', 'quantity', 'type'];
    const specFields = dynamicFields.map(({ field }) => field);
    return [...standardFields, ...specFields];
  };

  // Handle tab and enter key to move between fields
  const handleKeyDown = (e: React.KeyboardEvent, currentFieldName: string) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault(); // Prevent default tab behavior

      const allFields = getAllFields();
      
      // Find the current field index
      const currentIndex = allFields.indexOf(currentFieldName);

      // Determine the next field index
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + allFields.length) % allFields.length // Go backwards with Shift+Tab
        : (currentIndex + 1) % allFields.length; // Go forwards with Tab

      const nextField = allFields[nextIndex];

      // Focus the next field
      if (inputRefs.current[nextField]) {
        inputRefs.current[nextField]?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    // Extract dynamic field values into specifications
    const specifications: Record<string, any> = { ...formData.specifications };
    dynamicFields.forEach(({ field }) => {
      if (formData[field] !== undefined) {
        specifications[field] = formData[field];
        delete formData[field]; // Remove from root to avoid duplication
      }
    });

    // Construct the final form data
    const standardFormData = {
      article: formData.article,
      quantity: formData.quantity,
      type: formData.type,
      specifications
    };

    // Add the orderListId to the form data if creating a new item
    const completeFormData = isEditing
      ? { ...standardFormData }
      : { ...standardFormData, orderListId };

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
          {/* Standard fields */}
          <div className="space-y-2">
            <Label htmlFor="article">Article*</Label>
            <Input
              id="article"
              name="article"
              value={formData.article || ''}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'article')}
              ref={(el) => (inputRefs.current.article = el)}
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
              value={formData.quantity || 1}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'quantity')}
              ref={(el) => (inputRefs.current.quantity = el)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type*</Label>
            <Input
              id="type"
              name="type"
              value={formData.type || ''}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'type')}
              ref={(el) => (inputRefs.current.type = el)}
              required
              placeholder="e.g. Halfen HTA Profile"
            />
          </div>

          {/* Dynamic fields from PDF mapping */}
          {dynamicFields.length > 0 && (
            <>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Product-Specific Fields</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  These fields are specific to {manufacturer} {productType} orders.
                </p>
              </div>
              
              {dynamicFields.map(({ pdfField, field }) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{pdfField}</Label>
                  <Input
                    id={field}
                    name={field}
                    value={formData[field] || ''}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, field)}
                    ref={(el) => (inputRefs.current[field] = el)}
                    placeholder={`Enter ${pdfField}`}
                  />
                </div>
              ))}
            </>
          )}

          {/* Add remaining specifications field for any other data */}
          {dynamicFields.length === 0 && (
            <div className="space-y-2">
              <Label htmlFor="specifications">Specifications</Label>
              <Textarea
                id="specifications"
                name="specifications"
                value={typeof formData.specifications === 'object' 
                  ? JSON.stringify(formData.specifications, null, 2)
                  : String(formData.specifications || '')}
                onChange={(e) => {
                  try {
                    const jsonValue = JSON.parse(e.target.value);
                    setFormData(prev => ({ ...prev, specifications: jsonValue }));
                  } catch {
                    setFormData(prev => ({ ...prev, specifications: { text: e.target.value } }));
                  }
                }}
                ref={(el) => (inputRefs.current.specifications = el)}
                placeholder="Enter additional specifications for this item"
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Enter specifications as plain text, or as a JSON object for structured data.
              </p>
            </div>
          )}

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