// types/pdfMapping.ts
export type FieldSource = 'project' | 'part' | 'orderList' | 'item' | 'custom';

export type FieldMapping = {
  pdfField: string;
  source: FieldSource;
  field: string;
  transform?: string; // Optional transformation function name
};

export type PdfMapping = {
  id: string;
  templateId: string;
  mappings: FieldMapping[];
};