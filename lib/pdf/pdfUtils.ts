// lib/pdf/pdfUtil.ts

// Type definitions for PDF field information
export interface PDFField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'button' | 'signature' | 'unknown';
  value?: string;
  options?: string[]; // For dropdown and radio fields
  required?: boolean;
  readOnly?: boolean;
  rect?: { x: number; y: number; width: number; height: number }; // Position and size
}

/**
 * Extracts form field information from a PDF ArrayBuffer
 * This is a helper function for development to help discover field names in PDF forms
 */
export async function extractPDFFormFields(pdfBuffer: ArrayBuffer): Promise<PDFField[]> {
  try {
    // Use dynamic import for PDF.js to avoid server-side rendering issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;
    
    const fields: PDFField[] = [];
    
    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const annotations = await page.getAnnotations();
      
      // Filter for form field annotations
      const formFields = annotations.filter(ann => ann.subtype === 'Widget');
      
      // Process each form field
      for (const field of formFields) {
        let fieldType: PDFField['type'] = 'unknown';
        
        switch (field.fieldType) {
          case 'Tx':
            fieldType = 'text';
            break;
          case 'Btn':
            if (field.checkBox) {
              fieldType = 'checkbox';
            } else if (field.radioButton) {
              fieldType = 'radio';
            } else {
              fieldType = 'button';
            }
            break;
          case 'Ch':
            fieldType = 'dropdown';
            break;
          case 'Sig':
            fieldType = 'signature';
            break;
        }
        
        // Create field info object
        const fieldInfo: PDFField = {
          name: field.fieldName || `unknown_field_${fields.length}`,
          type: fieldType,
          value: field.fieldValue,
          required: field.required,
          readOnly: field.readOnly,
        };
        
        // Add options for dropdown fields
        if (fieldType === 'dropdown' && field.options) {
          fieldInfo.options = field.options;
        }
        
        // Add rectangle information if available
        if (field.rect) {
          fieldInfo.rect = {
            x: field.rect[0],
            y: field.rect[1],
            width: field.rect[2] - field.rect[0],
            height: field.rect[3] - field.rect[1]
          };
        }
        
        fields.push(fieldInfo);
      }
    }
    
    return fields;
  } catch (error) {
    console.error('Error extracting PDF form fields:', error);
    throw error;
  }
}

/**
 * Helper function to create a mapping template from extracted PDF fields
 * This is useful during development to generate a starting point for form mappings
 */
export function createMappingTemplateFromFields(fields: PDFField[]): Record<string, { source: string; field: string }> {
  const mapping: Record<string, { source: string; field: string }> = {};
  
  fields.forEach(field => {
    // Try to guess the source and field based on the field name
    let source = 'custom';
    let fieldName = '';
    
    const lowerName = field.name.toLowerCase();
    
    if (lowerName.includes('project')) {
      source = 'project';
      // Try to extract the field name
      if (lowerName.includes('name')) {
        fieldName = 'name';
      } else if (lowerName.includes('number')) {
        fieldName = 'projectNumber';
      } else if (lowerName.includes('address')) {
        fieldName = 'address';
      } else if (lowerName.includes('manager')) {
        fieldName = 'projectManager';
      } else if (lowerName.includes('designer')) {
        fieldName = 'designer';
      } else {
        fieldName = 'name'; // Default
      }
    } else if (lowerName.includes('part')) {
      source = 'part';
      if (lowerName.includes('name')) {
        fieldName = 'name';
      } else if (lowerName.includes('number')) {
        fieldName = 'partNumber';
      } else {
        fieldName = 'name'; // Default
      }
    } else if (lowerName.includes('list') || lowerName.includes('order')) {
      source = 'orderList';
      if (lowerName.includes('name')) {
        fieldName = 'name';
      } else if (lowerName.includes('number')) {
        fieldName = 'listNumber';
      } else if (lowerName.includes('manufacturer')) {
        fieldName = 'manufacturer';
      } else if (lowerName.includes('type')) {
        fieldName = 'type';
      } else {
        fieldName = 'name'; // Default
      }
    } else if (lowerName.includes('date')) {
      source = 'custom';
      fieldName = 'currentDate';
    } else {
      // Default to custom and use the field name itself
      source = 'custom';
      fieldName = field.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    }
    
    mapping[field.name] = { source, field: fieldName };
  });
  
  return mapping;
}

/**
 * Utility function to fetch and analyze a PDF form template
 * This is useful during development to understand the structure of a PDF form
 */
export async function analyzePDFForm(url: string): Promise<{
  fields: PDFField[];
  mappingTemplate: Record<string, { source: string; field: string }>;
}> {
  try {
    // Fetch the PDF
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    const pdfBuffer = await response.arrayBuffer();
    
    // Extract fields
    const fields = await extractPDFFormFields(pdfBuffer);
    
    // Create a mapping template
    const mappingTemplate = createMappingTemplateFromFields(fields);
    
    return { fields, mappingTemplate };
  } catch (error) {
    console.error('Error analyzing PDF form:', error);
    throw error;
  }
}