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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderList, OrderListFormData } from '@/types/orderList';

// Field configuration for focusing
const fieldOrder = [
  'listNumber',
  'name',
  'manufacturer',
  'type',
  'designer',
  'projectManager',
];

// Temporary manufacturer options - these will come from an API/DB later
const manufacturerOptions = [
  { id: 'ancotech', name: 'Ancotech' },
  { id: 'debrunner', name: 'Debrunner' },
  { id: 'halfen', name: 'Halfen' },
  { id: 'hilti', name: 'Hilti' },
];

// Temporary product type options - these will be filtered by manufacturer later
const productTypeOptions = [
  { id: 'comax-typ-a', name: 'COMAX-Typ-A', manufacturer: 'ancotech' },
  { id: 'comax-typ-b', name: 'COMAX-Typ-B', manufacturer: 'ancotech' },
  { id: 'console-acinox', name: 'Console Acinox', manufacturer: 'debrunner' },
  { id: 'halfen-hta', name: 'Halfen HTA', manufacturer: 'halfen' },
  { id: 'hit-elements', name: 'HIT Elements', manufacturer: 'hilti' },
];

interface OrderListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (orderList: OrderList | Partial<OrderList>) => void;
  orderList?: OrderList;
  partId: string;
  partName?: string;
  defaultDesigner?: string;
  defaultProjectManager?: string;
}

export function OrderListDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  orderList,
  partId,
  partName = '',
  defaultDesigner = '',
  defaultProjectManager = ''
}: OrderListDialogProps) {
  const isEditing = !!orderList;
  
  // Create refs for each input field
  const inputRefs = {
    listNumber: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    manufacturer: useRef<HTMLButtonElement>(null),
    type: useRef<HTMLButtonElement>(null),
    designer: useRef<HTMLInputElement>(null),
    projectManager: useRef<HTMLInputElement>(null),
  };
  
  const [formData, setFormData] = useState<Omit<OrderListFormData, 'partId' | 'status' | 'submissionDate'>>({
    listNumber: '',
    name: '',
    manufacturer: '',
    type: '',
    designer: '',
    projectManager: '',
  });

  const [filteredTypes, setFilteredTypes] = useState(productTypeOptions);

  // Filter product types based on selected manufacturer
  useEffect(() => {
    if (formData.manufacturer) {
      const filtered = productTypeOptions.filter(
        type => type.manufacturer === formData.manufacturer.toLowerCase()
      );
      setFilteredTypes(filtered);
      
      // Clear type selection if current selection is not valid for new manufacturer
      const currentTypeIsValid = filtered.some(type => type.id === formData.type);
      if (!currentTypeIsValid) {
        setFormData(prev => ({ ...prev, type: '' }));
      }
    } else {
      setFilteredTypes([]);
    }
  }, [formData.manufacturer]);

  // Reset form when dialog opens/closes or order list changes
  useEffect(() => {
    if (orderList) {
      console.log('Setting form data from order list:', orderList);
      setFormData({
        listNumber: orderList.listNumber,
        name: orderList.name,
        manufacturer: orderList.manufacturer,
        type: orderList.type,
        designer: orderList.designer,
        projectManager: orderList.projectManager,
      });
    } else if (open) {
      // Reset form when opening for a new order list
      // Use part name and default values from project part for name, designer and projectManager
      setFormData({
        listNumber: '',
        name: partName ? `Liste - ${partName}` : '',
        manufacturer: '',
        type: '',
        designer: defaultDesigner,
        projectManager: defaultProjectManager,
      });
    }
  }, [orderList, open, partName, defaultDesigner, defaultProjectManager]);

  // Focus the first field when the dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the dialog is fully rendered
      setTimeout(() => {
        inputRefs.listNumber.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Add the partId and status to the form data
    const completeFormData = {
      ...formData,
      partId: partId,
      status: 'draft', // Default status for new order lists
      submissionDate: null,
    };
    
    if (isEditing && orderList) {
      console.log('Updating order list with ID:', orderList.id);
      onSave({ ...completeFormData, id: orderList.id });
    } else {
      console.log('Creating new order list for part ID:', partId);
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
            {isEditing ? `Edit Order List: ${orderList?.name}` : 'Create New Order List'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="listNumber">List Number*</Label>
            <Input
              id="listNumber"
              name="listNumber"
              value={formData.listNumber}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'listNumber')}
              ref={inputRefs.listNumber}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">List Name*</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'name')}
              ref={inputRefs.name}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer*</Label>
            <Select 
              value={formData.manufacturer} 
              onValueChange={(value) => handleSelectChange('manufacturer', value)}
              required
            >
              <SelectTrigger 
                id="manufacturer" 
                ref={inputRefs.manufacturer}
                onKeyDown={(e) => handleKeyDown(e, 'manufacturer')}
              >
                <SelectValue placeholder="Select a manufacturer" />
              </SelectTrigger>
              <SelectContent>
                {manufacturerOptions.map(manufacturer => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Product Type*</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleSelectChange('type', value)}
              disabled={!formData.manufacturer}
              required
            >
              <SelectTrigger 
                id="type" 
                ref={inputRefs.type}
                onKeyDown={(e) => handleKeyDown(e, 'type')}
              >
                <SelectValue placeholder={
                  formData.manufacturer 
                    ? "Select a product type" 
                    : "Select a manufacturer first"
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredTypes.length > 0 ? (
                  filteredTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No types available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designer">Designer*</Label>
              <Input
                id="designer"
                name="designer"
                value={formData.designer}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'designer')}
                ref={inputRefs.designer}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectManager">Project Manager*</Label>
              <Input
                id="projectManager"
                name="projectManager"
                value={formData.projectManager}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'projectManager')}
                ref={inputRefs.projectManager}
                required
              />
            </div>
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
              {isEditing ? 'Save Changes' : 'Create Order List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}