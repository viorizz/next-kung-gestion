// types/project.ts
import { Company } from './company';

export type Project = {
  id: string;
  projectNumber: string;
  name: string;
  address: string;
  // Original string fields
  masonryCompany: string | null;
  architect: string | null;
  engineer: string | null;
  owner: string | null;
  // UUID reference fields
  masonryCompanyId: string | null;
  architectId: string | null;
  engineerId: string | null;
  ownerId: string | null;
  // Company objects
  masonryCompanyObj?: any;
  architectObj?: any;
  engineerObj?: any;
  ownerObj?: any;
  // Other fields
  designer: string;
  projectManager: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

// Add the EnrichedProjectData interface here
export interface EnrichedProjectData {
  id: string;
  name: string;
  projectNumber?: string;
  address: string;
  designer: string;
  projectManager: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  engineer: Company | null;
  masonryCompany: Company | null;
  architect: Company | null;
  owner: Company | null;
}

export type ProjectFormData = Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 
  'masonryCompanyObj' | 'architectObj' | 'engineerObj' | 'ownerObj'>;