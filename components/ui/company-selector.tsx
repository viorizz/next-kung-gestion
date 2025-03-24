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
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  companyType?: string;
  disabled?: boolean;
  className?: string;
}

export function CompanySelector({
  value,
  onChange,
  placeholder,
  companyType,
  disabled = false,
  className,
}: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('Failed to load companies:', error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [companyType]);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the selected company
  const selectedCompany = companies.find(company => company.name === value);

  // Handle selecting a company
  const handleSelect = (companyName: string) => {
    onChange(companyName);
    setOpen(false);
  };

  // Clear the selected value
  const handleClear = () => {
    onChange('');
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
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? (
            <div className="flex items-center justify-between w-full">
              <span>{selectedCompany?.name || value}</span>
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
                    value === company.name && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(company.name)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === company.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {company.name}
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}