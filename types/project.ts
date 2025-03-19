// types/project.ts
export type Project = {
    id: string;
    projectNumber: string;
    name: string;
    address: string;
    masonryCompany: string | null;
    architect: string | null;
    engineer: string | null;
    owner: string | null;
    designer: string;
    projectManager: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  
  export type ProjectFormData = Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;