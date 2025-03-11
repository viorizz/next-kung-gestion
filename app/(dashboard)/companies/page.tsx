'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CompanyCard } from '@/components/ui/companycard';
import { CompanyDialog } from '@/components/ui/companydialog';
import { PlusIcon } from 'lucide-react';

// Temporary type definition for Company
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

export default function CompaniesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // Temporary mock data
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: '1',
      name: 'Küng & Associés SA',
      street: 'Rue Des Granges 14',
      postalCode: '1530',
      city: 'Payerne',
      country: 'Suisse',
      phone: '+41266603177',
      email: 'payerne@kung-sa.ch',
      type: 'Engineer'
    },
    {
      id: '2',
      name: 'Ernest Gabella SA',
      street: 'Rue Des Champs-Lovats 19',
      postalCode: '1400',
      city: 'Yverdon-les-Bains',
      country: 'Suisse',
      phone: '+41244241199',
      email: 'info@gabella.ch',
      type: 'Masonry'
    }
  ]);

  const handleAddCompany = (company: Omit<Company, 'id'>) => {
    // Generate a temporary ID (would be handled by the backend in a real app)
    const newCompany = {
      ...company,
      id: Date.now().toString()
    };
    
    setCompanies([...companies, newCompany]);
    setIsAddDialogOpen(false);
  };

  const handleEditCompany = (company: Company) => {
    setCompanies(companies.map(c => c.id === company.id ? company : c));
    setEditingCompany(null);
  };

  const handleEditClick = (company: Company) => {
    setEditingCompany(company);
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        Dashboard / Sociétés
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sociétés</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter une société
        </Button>
      </div>
      
      {/* Company Cards */}
      <div className="space-y-4">
        {companies.map(company => (
          <CompanyCard 
            key={company.id} 
            company={company} 
            onEditClick={() => handleEditClick(company)} 
          />
        ))}
      </div>
      
      {/* Add Company Dialog */}
      <CompanyDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddCompany}
      />
      
      {/* Edit Company Dialog */}
      {editingCompany && (
        <CompanyDialog 
          open={editingCompany !== null}
          onOpenChange={(open: boolean) => !open && setEditingCompany(null)}
          onSave={handleEditCompany}
          company={editingCompany}
        />
      )}
    </div>
  );
}