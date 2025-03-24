'use client';

import { useState, useEffect } from 'react';
import { Combobox, ComboboxItem } from '@/components/ui/combobox';
import { companyService } from '@/lib/services/companyService';
import { Company } from '@/types/company';

interface CompanyComboboxProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  companyType?: string;
  disabled?: boolean;
  className?: string;
}

export function CompanyCombobox({ 
  value, 
  onChange, 
  placeholder,
  companyType,
  disabled = false,
  className
}: CompanyComboboxProps) {
  const [companies, setCompanies] = useState<ComboboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        // Fetch all companies, or filter by type if provided
        let data: Company[];
        if (companyType) {
          data = await companyService.getCompaniesByType(companyType, 'current');
        } else {
          data = await companyService.getCompanies('current');
        }
        
        // Convert to ComboboxItem format
        const items: ComboboxItem[] = data.map(company => ({
          value: company.name,
          label: company.name
        }));
        
        setCompanies(items);
      } catch (error) {
        console.error('Failed to load companies:', error);
        // Set empty array on error
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [companyType]);

  return (
    <Combobox
    
      items={companies}
      value={value || ""}
      onChange={onChange}
      placeholder={loading ? 'Loading...' : placeholder}
      emptyMessage={loading ? 'Loading companies...' : 'No companies found.'}
      disabled={disabled || loading}
      className={className}
    />
  );
}