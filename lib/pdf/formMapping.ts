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
        // Item-specific fields
        'itemLength': { source: 'item', field: 'length' },
        'itemWidth': { source: 'item', field: 'width' },
        'itemMaterial': { source: 'item', field: 'material' },
        'itemFinish': { source: 'item', field: 'finish' },
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
        // Item-specific fields
        'itemDiameter': { source: 'item', field: 'diameter' },
        'itemThickness': { source: 'item', field: 'thickness' },
        'itemColor': { source: 'item', field: 'color' },
      }
    },
    'debrunner': {
      'console-acinox': {
        ...defaultMapping,
        // Console Acinox specific field mappings
        'productType': { source: 'orderList', field: 'type' },
        'steelGrade': { source: 'custom', field: 'steelGrade', transform: () => 'S355' },
        // Item-specific fields
        'itemModel': { source: 'item', field: 'model' },
        'itemLoadCapacity': { source: 'item', field: 'loadCapacity' },
        'itemMountingType': { source: 'item', field: 'mountingType' },
        'itemCertification': { source: 'item', field: 'certification' },
      }
    },
    'halfen': {
      'halfen-hta': {
        ...defaultMapping,
        // Halfen HTA specific field mappings
        'profileType': { source: 'orderList', field: 'type' },
        'steelGrade': { source: 'custom', field: 'steelGrade', transform: () => 'HCR' },
        // Item-specific fields
        'itemLength': { source: 'item', field: 'length' },
        'itemProfile': { source: 'item', field: 'profile' },
        'itemCoating': { source: 'item', field: 'coating' },
        'itemCorrosionClass': { source: 'item', field: 'corrosionClass' },
        'itemConnectionType': { source: 'item', field: 'connectionType' },
      }
    },
    'hilti': {
      'hit-elements': {
        ...defaultMapping,
        // HIT Elements specific field mappings
        'productLine': { source: 'orderList', field: 'type' },
        // Item-specific fields
        'itemDiameter': { source: 'item', field: 'diameter' },
        'itemAnchoring': { source: 'item', field: 'anchoring' },
        'itemBaseType': { source: 'item', field: 'baseType' },
        'itemConcreteDensity': { source: 'item', field: 'concreteDensity' },
        'itemInstallMethod': { source: 'item', field: 'installMethod' },
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
    
    // Create item field counter to handle multiple items
    const itemFieldIndices: Record<string, number> = {};
    
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
          // For item fields, handle them differently to support multiple items
          if (itemsData.length > 0) {
            // Get the item index for this field, or default to 0
            const itemIndex = itemFieldIndices[field] || 0;
            
            // If we have an item at this index, get its value
            if (itemIndex < itemsData.length) {
              // Check if the field is in specifications or directly on the item
              if (itemsData[itemIndex][field] !== undefined) {
                value = itemsData[itemIndex][field];
              } else if (itemsData[itemIndex].specifications?.[field] !== undefined) {
                value = itemsData[itemIndex].specifications[field];
              } else {
                value = '';
              }
              
              // Increment the index for the next occurrence of this field
              itemFieldIndices[field] = itemIndex + 1;
            } else {
              value = '';
            }
          } else {
            value = '';
          }
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