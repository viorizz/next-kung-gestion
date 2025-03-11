'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { CompanyCard } from '@/components/ui/companycard';
import { CompanyDialog } from '@/components/ui/companydialog';
import { PlusIcon, Loader2 } from 'lucide-react';
import { companyService } from '@/lib/services/companyService';
import { Company, CompanyFormData } from '@/types/company';
import { toast } from 'sonner';

export default function CompaniesPage() {
  const { user, isLoaded } = useUser();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    // Fetch companies when user is loaded
    if (isLoaded && user) {
      fetchCompanies();
    }
  }, [isLoaded, user]);

  const fetchCompanies = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await companyService.getCompanies(user.id);
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Une erreur est survenue lors du chargement des sociétés');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompany = async (formData: CompanyFormData) => {
    if (!user) return;
    
    try {
      await companyService.createCompany(formData, user.id);
      toast.success('Société ajoutée avec succès');
      setIsAddDialogOpen(false);
      fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Une erreur est survenue lors de l\'ajout de la société');
    }
  };

  const handleEditCompany = async (company: Company | Omit<Company, 'id'>) => {
    if (!user) return;
    
    // Make sure we have an ID (should always be the case for editing, but TypeScript needs this check)
    const companyId = 'id' in company ? company.id : '';
    
    if (!companyId) {
      throw new Error('Cannot update company without ID');
    }
    
    try {
      const formData: Partial<CompanyFormData> = {
        name: company.name,
        street: company.street,
        postalCode: company.postalCode,
        city: company.city,
        country: company.country,
        phone: company.phone,
        email: company.email,
        type: company.type
      };
      
      await companyService.updateCompany(companyId, formData);
      toast.success('Société mise à jour avec succès');
      setEditingCompany(null);
      fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Une erreur est survenue lors de la mise à jour de la société');
    }
  };

  const handleEditClick = (company: Company) => {
    setEditingCompany(company);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
      {companies.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            Aucune société trouvée. Commencez par en ajouter une.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map(company => (
            <CompanyCard 
              key={company.id} 
              company={company} 
              onEditClick={() => handleEditClick(company)} 
            />
          ))}
        </div>
      )}
      
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