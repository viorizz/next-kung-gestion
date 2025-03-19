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

// Type definition for Company
type Company = {
  id: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  type: string;
};

// Company types options
const companyTypes = [
  { id: 'engineer', name: 'Engineer' },
  { id: 'masonry', name: 'Masonry' },
  { id: 'architect', name: 'Architect' },
  { id: 'contractor', name: 'Contractor' },
  { id: 'supplier', name: 'Supplier' },
];

// Field configuration for focusing
const fieldOrder = [
  'name',
  'street',
  'postalCode',
  'city',
  'country',
  'type',
  'email',
  'phone',
];

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (company: Company | Partial<Company>) => void;
  company?: Company;
}

export function CompanyDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  company 
}: CompanyDialogProps) {
  const isEditing = !!company;
  
  // Create refs for each input field
  const inputRefs = {
    name: useRef<HTMLInputElement>(null),
    street: useRef<HTMLInputElement>(null),
    postalCode: useRef<HTMLInputElement>(null),
    city: useRef<HTMLInputElement>(null),
    country: useRef<HTMLInputElement>(null),
    type: useRef<HTMLButtonElement>(null), // For SelectTrigger
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
  };
  
  const [formData, setFormData] = useState<Omit<Company, 'id'>>({
    name: '',
    street: '',
    postalCode: '',
    city: '',
    country: 'Suisse', // Default to Switzerland
    phone: '',
    email: '',
    type: '',
  });

  // Reset form when dialog opens/closes or company changes
  useEffect(() => {
    if (company) {
      console.log('Setting form data from company:', company);
      setFormData({
        name: company.name,
        street: company.street,
        postalCode: company.postalCode,
        city: company.city,
        country: company.country || 'Suisse',
        phone: company.phone || '',
        email: company.email || '',
        type: company.type,
      });
    } else if (open) {
      // Reset form when opening for a new company
      setFormData({
        name: '',
        street: '',
        postalCode: '',
        city: '',
        country: 'Suisse',
        phone: '',
        email: '',
        type: '',
      });
    }
  }, [company, open]);

  // Focus the first field when the dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the dialog is fully rendered
      setTimeout(() => {
        inputRefs.name.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
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
    
    if (isEditing && company) {
      console.log('Updating company with ID:', company.id);
      onSave({ ...formData, id: company.id });
    } else {
      console.log('Creating new company');
      onSave(formData);
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
            {isEditing ? `Modifier la société: ${company?.name}` : 'Ajouter une société'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la société*</Label>
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
            <Label htmlFor="street">Adresse*</Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'street')}
              ref={inputRefs.street}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal*</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'postalCode')}
                ref={inputRefs.postalCode}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Ville*</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'city')}
                ref={inputRefs.city}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Pays*</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'country')}
              ref={inputRefs.country}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type de société*</Label>
            <Select 
              value={formData.type} 
              onValueChange={handleSelectChange}
              required
            >
              <SelectTrigger 
                id="type" 
                ref={inputRefs.type}
                onKeyDown={(e) => handleKeyDown(e, 'type')}
              >
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {companyTypes.map(type => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'email')}
                ref={inputRefs.email}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'phone')}
                ref={inputRefs.phone}
                placeholder="+41 XX XXX XX XX"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Enregistrer' : 'Créer la société'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}