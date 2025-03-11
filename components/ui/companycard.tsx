'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPinIcon, PhoneIcon, MailIcon, BriefcaseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface CompanyCardProps {
  company: Company;
  onEditClick: () => void;
}

export function CompanyCard({ company, onEditClick }: CompanyCardProps) {
  const fullAddress = `${company.street}, ${company.postalCode} ${company.city}, ${company.country}`;
  
  return (
    <Card className="bg-card hover:bg-accent/10 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-xl">{company.name}</CardTitle>
        <div className="text-sm px-3 py-1 rounded bg-primary/10 text-primary font-medium">
          {company.type}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{fullAddress}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{company.phone}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MailIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{company.email}</span>
          </div>
          
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="sm" onClick={onEditClick}>
              Modifier
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}