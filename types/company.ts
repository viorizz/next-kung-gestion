// types/company.ts

export type Company = {
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
  
  export type CompanyFormData = Omit<Company, 'id'>;
  
  export const COMPANY_TYPES = [
    { id: 'engineer', name: 'Engineer' },
    { id: 'masonry', name: 'Masonry' },
    { id: 'architect', name: 'Architect' },
    { id: 'contractor', name: 'Contractor' },
    { id: 'supplier', name: 'Supplier' },
  ];