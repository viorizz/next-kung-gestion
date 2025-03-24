// lib/pdf/formMapping.ts

// Define interfaces for mapping configurations
interface FieldMapping {
    source: 'project' | 'part' | 'orderList' | 'item' | 'custom';
    field: string;
    transform?: (value: any) => string; // Optional transformation function
  }
  
  interface FormMappingConfig {
    [pdfField: string]: FieldMapping;
  }
  
  // Template-specific mapping configurations
  interface ManufacturerMapping {
    [productType: string]: FormMappingConfig;
  }
  
  interface ProductMapping {
    [manufacturer: string]: ManufacturerMapping;
  }
  
  // Define default mappings that apply to most forms
  const defaultMapping: FormMappingConfig = {
    // Project information
    'projectName': { source: 'project', field: 'name' },
    'projectNumber': { source: 'project', field: 'projectNumber' },
    'projectAddress': { source: 'project', field: 'address' },
    'projectDesigner': { source: 'project', field: 'designer' },
    'projectManager': { source: 'project', field: 'projectManager' },
    
    // Part information
    'partName': { source: 'part', field: 'name' },
    'partNumber': { source: 'part', field: 'partNumber' },
    
    // Order list information
    'listNumber': { source: 'orderList', field: 'listNumber' },
    'listName': { source: 'orderList', field: 'name' },
    'designer': { source: 'orderList', field: 'designer' },
    'manager': { source: 'orderList', field: 'projectManager' },
    
    // Date fields (with transformation)
    'date': { 
      source: 'custom', 
      field: 'currentDate',
      transform: () => new Date().toLocaleDateString() 
    },
  };
  
  // Manufacturer-specific mappings
  export const formMappings: ProductMapping = {
    'ancotech': {
      'comax-typ-a': {
        ...defaultMapping,
        // COMAX-Typ-A specific field mappings
        'productType': { source: 'orderList', field: 'type' },
        'productCode': { 
          source: 'custom', 
          field: 'productCode',
          transform: (orderList) => `COMAX-TYP-A-${orderList.listNumber}` 
        },
        // Add more specific field mappings as needed
      },
      'comax-typ-b': {
        ...defaultMapping,
        // COMAX-Typ-B specific field mappings
        'productType': { source: 'orderList', field: 'type' },
        'productCode': { 
          source: 'custom', 
          field: 'productCode',
          transform: (orderList) => `COMAX-TYP-B-${orderList.listNumber}` 
        },
        // Add more specific field mappings as needed
      }
    },
    'debrunner': {
      'console-acinox': {
        ...defaultMapping,
        // Console Acinox specific field mappings
        'productType': { source: 'orderList', field: 'type' },
        'steelGrade': { source: 'custom', field: 'steelGrade', transform: () => 'S355' },
        // Add more specific field mappings as needed
      }
    },
    'halfen': {
      'halfen-hta': {
        ...defaultMapping,
        // Halfen HTA specific field mappings
        'profileType': { source: 'orderList', field: 'type' },
        'steelGrade': { source: 'custom', field: 'steelGrade', transform: () => 'HCR' },
        // Add more specific field mappings as needed
      }
    },
    'hilti': {
      'hit-elements': {
        ...defaultMapping,
        // HIT Elements specific field mappings
        'productLine': { source: 'orderList', field: 'type' },
        // Add more specific field mappings as needed
      }
    }
  };
  
  // Helper function to get the form mapping for a specific manufacturer and product type
  export function getFormMapping(manufacturer: string, productType: string): FormMappingConfig {
    // Convert to lowercase for case-insensitive lookup
    const normalizedManufacturer = manufacturer.toLowerCase();
    const normalizedProductType = productType.toLowerCase();
    
    // Try to get the specific mapping
    if (
      formMappings[normalizedManufacturer] && 
      formMappings[normalizedManufacturer][normalizedProductType]
    ) {
      return formMappings[normalizedManufacturer][normalizedProductType];
    }
    
    // Fall back to default mapping if specific one is not found
    console.warn(`No specific mapping found for ${manufacturer}/${productType}, using default mapping`);
    return defaultMapping;
  }
  
  // Helper function to apply all transformations and get the final data for PDF form filling
  export function applyFormMapping(
    mapping: FormMappingConfig,
    projectData: any,
    partData: any,
    orderListData: any,
    itemsData: any[] = []
  ): Record<string, string> {
    const result: Record<string, string> = {};
    
    Object.entries(mapping).forEach(([pdfField, { source, field, transform }]) => {
      let value: any = '';
      
      // Get the raw value based on the source
      switch (source) {
        case 'project':
          value = projectData?.[field] ?? '';
          break;
        case 'part':
          value = partData?.[field] ?? '';
          break;
        case 'orderList':
          value = orderListData?.[field] ?? '';
          break;
        case 'item':
          // Items are handled differently as they might be multiple
          // For now, we'll just take the first item's value if available
          value = itemsData[0]?.[field] ?? '';
          break;
        case 'custom':
          // Custom fields may have special handling
          if (field === 'currentDate') {
            value = new Date();
          }
          // Add more custom field handlers as needed
          break;
      }
      
      // Apply transformation if defined
      if (transform) {
        try {
          result[pdfField] = transform(value);
        } catch (error) {
          console.error(`Error transforming field ${pdfField}:`, error);
          result[pdfField] = String(value);
        }
      } else {
        // Use the value as is
        result[pdfField] = String(value);
      }
    });
    
    return result;
  }