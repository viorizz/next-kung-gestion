  // types/projectPart.ts
  export type ProjectPart = {
    id: string;
    projectId: string;
    partNumber: string;
    name: string;
    designer: string;
    projectManager: string;
    createdAt: string;
    updatedAt: string;
  };
  
  export type ProjectPartFormData = Omit<ProjectPart, 'id' | 'createdAt' | 'updatedAt'>;