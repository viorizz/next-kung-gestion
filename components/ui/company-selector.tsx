'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { companyService } from '@/lib/services/companyService';
import { Company } from '@/types/company';

interface CompanySelectorProps {
  companyId: string | null;
  onSelectCompany: (id: string, name: string) => void;
  placeholder: string;
  companyType?: string;
  disabled?: boolean;
  className?: string;
}

export function CompanySelector({
  companyId,
  onSelectCompany,
  placeholder,
  companyType,
  disabled = false,
  className,
}: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Fetch companies when component mounts or companyType changes
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        let data: Company[];
        if (companyType) {
          data = await companyService.getCompaniesByType(companyType, 'current');
        } else {
          data = await companyService.getCompanies('current');
        }
        
        console.log(`Loaded ${data.length} companies for type ${companyType || 'all'}`);
        setCompanies(data);
        
        // If we have a companyId, find and set the selected company
        if (companyId) {
          const found = data.find(company => company.id === companyId);
          setSelectedCompany(found || null);
        } else {
          setSelectedCompany(null);
        }
      } catch (error) {
        console.error('Failed to load companies:', error);
        setCompanies([]);
        setSelectedCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [companyType, companyId]);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selecting a company
  const handleSelect = (company: Company) => {
    setSelectedCompany(company);
    onSelectCompany(company.id, company.name);
    setOpen(false);
  };

  // Clear the selected value
  const handleClear = () => {
    setSelectedCompany(null);
    onSelectCompany('', '');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !selectedCompany && "text-muted-foreground",
            className
          )}
        >
          {selectedCompany ? (
            <div className="flex items-center justify-between w-full">
              <span>{selectedCompany.name}</span>
              {!disabled && (
                <X
                  className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              )}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-sm">Loading companies...</div>
            ) : filteredCompanies.length === 0 ? (
              <div className="py-6 text-center text-sm">No companies found.</div>
            ) : (
              filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className={cn(
                    "flex items-center px-2 py-2 rounded-sm text-sm cursor-pointer",
                    "hover:bg-accent hover:text-accent-foreground",
                    selectedCompany?.id === company.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(company)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCompany?.id === company.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {company.city}, {company.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}