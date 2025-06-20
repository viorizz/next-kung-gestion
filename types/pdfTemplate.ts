// types/pdfTemplate.ts
export type PdfTemplate = {
    id: string;
    manufacturer: string;
    productType: string;
    pdfUrl: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
    fieldMapping?: string | null;
  };
  
  export type PdfTemplateFormData = {
    manufacturer: string;
    productType: string;
    pdfUrl: string | null;
  };