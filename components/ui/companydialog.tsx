'use client';

import { useState, useEffect } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
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
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4" tabIndex={1}>
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la société*</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              tabIndex={0}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="street">Adresse*</Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
              tabIndex={0}
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
                required
                tabIndex={0}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Ville*</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                tabIndex={0}
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
              required
              tabIndex={0}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type de société*</Label>
            <Select 
              value={formData.type} 
              onValueChange={handleSelectChange}
              required
            >
              <SelectTrigger id="type" tabIndex={0}>
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
                tabIndex={0}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+41 XX XXX XX XX"
                tabIndex={0}
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              tabIndex={0}
            >
              Annuler
            </Button>
            <Button type="submit" tabIndex={0}>
              {isEditing ? 'Enregistrer' : 'Créer la société'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}