'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState, useEffect } from 'react';
import { companyService } from '@/lib/services/companyService';
import { Company } from '@/types/company';

interface CompanyComboboxProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  companyType?: string;
  disabled?: boolean;
}

export function CompanyCombobox({ 
  value, 
  onChange, 
  placeholder,
  companyType,
  disabled = false
}: CompanyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
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
        setCompanies(data);
      } catch (error) {
        console.error('Failed to load companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [companyType]);

  // Find the selected company
  const selectedCompany = value 
    ? companies.find(company => company.name === value) 
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>
            {loading ? 'Loading...' : 'No company found.'}
          </CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                value={company.name}
                onSelect={() => {
                  onChange(company.name);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === company.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {company.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}