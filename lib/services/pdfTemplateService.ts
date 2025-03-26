// lib/services/pdfTemplateService.ts
import { PdfTemplate } from '@/types/pdfTemplate'; // Assuming PdfTemplate includes fieldMapping

// Ensure your PdfTemplate type looks something like this:
// interface PdfTemplate {
//   id: string;
//   manufacturer: string;
//   productType: string;
//   pdfUrl: string | null;
//   userId: string;
//   createdAt?: string | Date; // Use consistent type (string or Date)
//   updatedAt?: string | Date; // Use consistent type (string or Date)
//   fieldMapping?: string | null; // Make sure this is defined
// }

// Helper function to convert database types (snake_case) to frontend types (camelCase)
const mapDbPdfTemplateToTemplate = (dbTemplate: any): PdfTemplate => ({
  id: dbTemplate.id,
  manufacturer: dbTemplate.manufacturer,
  productType: dbTemplate.product_type, // Assuming DB uses snake_case
  pdfUrl: dbTemplate.pdf_url, // Assuming DB uses snake_case
  userId: dbTemplate.user_id, // Assuming DB uses snake_case
  createdAt: dbTemplate.created_at, // Assuming DB uses snake_case
  updatedAt: dbTemplate.updated_at, // Assuming DB uses snake_case
  fieldMapping: dbTemplate.field_mapping ?? null, // Map field_mapping, default to null
});

// PDF Template service
export const pdfTemplateService = {
  // Get all templates for the current user (assuming API handles user context)
  async getTemplates(userId: string): Promise<PdfTemplate[]> {
    // Note: Passing userId might be redundant if API uses authentication context
    try {
      // Consider if filtering by userId should happen on the backend via auth
      const response = await fetch('/api/pdf-templates', {
        method: 'GET',
        // Add headers if authentication is needed, e.g., Authorization: Bearer token
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to fetch templates: ${response.status} ${response.statusText} - ${errorData}`
        );
      }

      const data = await response.json();
      // Ensure data is an array before mapping
      return Array.isArray(data) ? data.map(mapDbPdfTemplateToTemplate) : [];
    } catch (error) {
      console.error('Error in getTemplates:', error);
      throw error; // Re-throw to allow caller handling (e.g., showing toast)
    }
  },

  // Get template by manufacturer and product type
  async getTemplateByManufacturerAndType(
    manufacturer: string,
    productType: string,
    userId: string // Keep userId if API needs it for filtering/auth
  ): Promise<PdfTemplate | null> {
    try {
      // Construct query parameters safely
      const params = new URLSearchParams({ manufacturer, productType });
      // If userId is needed for filtering by the API: params.append('userId', userId);

      const response = await fetch(`/api/pdf-templates?${params.toString()}`, {
        method: 'GET',
        // Add headers if authentication is needed
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to fetch template by type: ${response.status} ${response.statusText} - ${errorData}`
        );
      }

      const data = await response.json();

      // API might return a single object or an array
      const result = Array.isArray(data) ? data[0] : data;

      if (!result) {
        return null; // Not found
      }

      return mapDbPdfTemplateToTemplate(result);
    } catch (error) {
      console.error('Error in getTemplateByManufacturerAndType:', error);
      throw error;
    }
  },

  // Create a new template
  // MODIFIED: Added fieldMapping argument
  async createTemplate(
    manufacturer: string,
    productType: string,
    pdfUrl: string,
    userId: string, // Keep userId if API needs it explicitly
    fieldMapping?: string | null // Added optional fieldMapping
  ): Promise<PdfTemplate> {
    try {
      const body = {
        manufacturer,
        productType,
        pdfUrl,
        // userId, // Only include if your API expects it in the body
        fieldMapping: fieldMapping || null, // Include fieldMapping, default to null
      };

      const response = await fetch('/api/pdf-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add headers if authentication is needed
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to create template: ${response.status} ${response.statusText} - ${errorData}`
        );
      }

      const data = await response.json();
      return mapDbPdfTemplateToTemplate(data); // Map the created template data
    } catch (error) {
      console.error('Error in createTemplate:', error);
      throw error;
    }
  },

  // Update an existing template
  // MODIFIED: Accepts partial updates object, uses PUT method
  async updateTemplate(
    templateId: string,
    updates: Partial<PdfTemplate> // Changed second argument to accept partial updates
  ): Promise<PdfTemplate> {
    try {
      // Filter out id/userId/createdAt/updatedAt from updates if they exist,
      // as they shouldn't typically be sent in the body for an update.
      const { id, userId, createdAt, updatedAt, ...updateData } = updates;

      // Use PUT method and include ID in the URL (RESTful convention)
      const response = await fetch(`/api/pdf-templates/${templateId}`, {
        method: 'PUT', // Changed to PUT
        headers: {
          'Content-Type': 'application/json',
          // Add headers if authentication is needed
        },
        body: JSON.stringify(updateData), // Send only the fields to update
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to update template: ${response.status} ${response.statusText} - ${errorData}`
        );
      }

      const data = await response.json();
      return mapDbPdfTemplateToTemplate(data); // Map the updated template data
    } catch (error) {
      console.error('Error in updateTemplate:', error);
      throw error;
    }
  },

  // Delete a template
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/pdf-templates/${templateId}`, {
        method: 'DELETE',
        // Add headers if authentication is needed
      });

      if (!response.ok) {
        // Handle 404 Not Found specifically?
        if (response.status === 404) {
          console.warn(`Template with ID ${templateId} not found for deletion.`);
          return false; // Or throw a specific "Not Found" error
        }
        const errorData = await response.text();
        throw new Error(
          `Failed to delete template: ${response.status} ${response.statusText} - ${errorData}`
        );
      }

      // Check for 204 No Content or 200 OK with success body
      return response.status === 204 || response.ok;
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      throw error;
    }
  },
};

export default pdfTemplateService;