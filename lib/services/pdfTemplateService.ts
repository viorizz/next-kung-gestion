// lib/services/pdfTemplateService.ts
import { PdfTemplate, PdfTemplateFormData } from '@/types/pdfTemplate';

// Helper function to convert database types to frontend types
const mapDbPdfTemplateToTemplate = (dbTemplate: any): PdfTemplate => ({
  id: dbTemplate.id,
  manufacturer: dbTemplate.manufacturer,
  productType: dbTemplate.product_type,
  pdfUrl: dbTemplate.pdf_url,
  userId: dbTemplate.user_id,
  createdAt: dbTemplate.created_at,
  updatedAt: dbTemplate.updated_at
});

// PDF Template service
export const pdfTemplateService = {
  // Get all templates for a user
  async getTemplates(userId: string): Promise<PdfTemplate[]> {
    try {
      const response = await fetch('/api/pdf-templates', {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.map(mapDbPdfTemplateToTemplate);
    } catch (error) {
      console.error('Error in getTemplates:', error);
      throw error;
    }
  },

  // Get template by manufacturer and product type
  async getTemplateByManufacturerAndType(manufacturer: string, productType: string, userId: string): Promise<PdfTemplate | null> {
    try {
      const response = await fetch(`/api/pdf-templates?manufacturer=${encodeURIComponent(manufacturer)}&productType=${encodeURIComponent(productType)}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        return null;
      }
      
      return mapDbPdfTemplateToTemplate(data[0]);
    } catch (error) {
      console.error('Error in getTemplateByManufacturerAndType:', error);
      throw error;
    }
  },

  // Create a new template
  async createTemplate(manufacturer: string, productType: string, pdfUrl: string, userId: string): Promise<PdfTemplate> {
    try {
      const response = await fetch('/api/pdf-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manufacturer,
          productType,
          pdfUrl
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create template: ${response.statusText}`);
      }
      
      const data = await response.json();
      return mapDbPdfTemplateToTemplate(data);
    } catch (error) {
      console.error('Error in createTemplate:', error);
      throw error;
    }
  },

  // Update a template
  async updateTemplate(templateId: string, pdfUrl: string | null): Promise<PdfTemplate> {
    try {
      const response = await fetch('/api/pdf-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: templateId,
          pdfUrl
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update template: ${response.statusText}`);
      }
      
      const data = await response.json();
      return mapDbPdfTemplateToTemplate(data);
    } catch (error) {
      console.error('Error in updateTemplate:', error);
      throw error;
    }
  },

  // Delete a template
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/pdf-templates/${templateId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      throw error;
    }
  }
};

export default pdfTemplateService;