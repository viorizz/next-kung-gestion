// Modify itemdialog.tsx to support dynamic fields based on mappings
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item } from '@/types/item';
import { getFormMapping } from '@/lib/pdf/formMapping';
import { pdfTemplateService } from '@/lib/services/pdfTemplateService';
import { useUser } from '@clerk/nextjs';

// Dynamic form field based on specifications from the template
interface DynamicItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Item | Partial<Item>) => void;
  item?: Item;
  orderListId: string;
  manufacturer: string;
  productType: string;
}

export function DynamicItemDialog({
  open,
  onOpenChange,
  onSave,
  item,
  orderListId,
  manufacturer,
  productType
}: DynamicItemDialogProps) {
  const { user } = useUser();
  const isEditing = !!item;
  const [formData, setFormData] = useState<any>({});
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load template and mapping
  useEffect(() => {
    const loadMapping = async () => {
      if (!user || !open) return;
      
      setIsLoading(true);
      try {
        // Get the template for this manufacturer/product type
        const template = await pdfTemplateService.getTemplateByManufacturerAndType(
          manufacturer,
          productType,
          user.id
        );
        
        if (!template) {
          console.warn('No template found for', manufacturer, productType);
          return;
        }
        
        // Get the field mapping for this template
        const mapping = getFormMapping(manufacturer, productType);
        
        // Generate dynamic form fields based on mapping
        const fields = Object.entries(mapping)
          .filter(([_, mapInfo]) => mapInfo.source === 'item') // Only get item fields
          .map(([pdfField, mapInfo]) => ({
            id: pdfField,
            name: mapInfo.field,
            label: pdfField,
            type: 'text', // Default type, could be enhanced
          }));
        
        setDynamicFields(fields);
        
        // Pre-fill with existing data if editing
        if (isEditing && item) {
          const initialData: any = {};
          fields.forEach(field => {
            initialData[field.name] = item[field.name as keyof Item] || '';
          });
          setFormData(initialData);
        }
      } catch (error) {
        console.error('Error loading template mapping:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMapping();
  }, [open, user, manufacturer, productType, isEditing, item]);
  
  const handleChange = (name: string, value: any) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the item with dynamic fields
    const itemData: Partial<Item> = {
      orderListId,
      position: item?.position,
      article: formData.article || '',
      quantity: parseInt(formData.quantity) || 1,
      type: formData.type || productType,
      specifications: { ...formData } // Store all dynamic fields in specifications
    };
    
    onSave(isEditing ? { ...itemData, id: item.id } : itemData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLoading ? (
            <div>Loading form fields...</div>
          ) : dynamicFields.length === 0 ? (
            // Standard fields if no mapping is available
            <>
              <div className="space-y-2">
                <Label htmlFor="article">Article</Label>
                <Input
                  id="article"
                  value={formData.article || ''}
                  onChange={(e) => handleChange('article', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || 1}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type || ''}
                  onChange={(e) => handleChange('type', e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            // Dynamic fields based on mapping
            <>
              {dynamicFields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    id={field.id}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                </div>
              ))}
            </>
          )}
          
          <DialogFooter>
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