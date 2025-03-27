// lib/services/projectService.ts
import { Project, ProjectFormData } from '@/types/project';

// --- Define or Import EnrichedProjectData ---
// Ensure this matches the structure needed by your client component
// and the structure being assembled by mapDbProjectToEnrichedProject.
interface Company {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  // Add any other fields your Company model might have (e.g., from Supabase)
  // Ensure these match the columns selected in your API route's getCompanyById
}

interface EnrichedProjectData {
  id: string;
  name: string;
  projectNumber?: string;
  address: string;
  designer: string;
  projectManager: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // --- Nested Company Objects ---
  // These keys MUST match the keys used in the client component
  engineer: Company | null;
  masonryCompany: Company | null;
  architect: Company | null;
  owner: Company | null;
  // Add other direct project fields if needed
}
// -------------------------------------------

// Helper function to convert DB project WITH 'Obj' RELATIONS to EnrichedProjectData
// --- UPDATED TO USE '...Obj' keys from your API ---
const mapDbProjectToEnrichedProject = (
  dbProjectWithRelations: any,
): EnrichedProjectData => {
  // Helper to safely map a company object (assuming it's already fetched)
  const mapCompany = (companyObj: any): Company | null => {
    // Check if the object exists and has an ID (basic validation)
    if (!companyObj || !companyObj.id) return null;
    return {
      id: companyObj.id,
      name: companyObj.name, // Assuming 'name' field exists
      address: companyObj.address ?? undefined, // Use actual column names
      city: companyObj.city ?? undefined, // Use actual column names
      phone: companyObj.phone ?? undefined, // Use actual column names
      // Map other company fields if they exist in the object
    };
  };

  return {
    // Map base project fields (use actual column names from Supabase response)
    id: dbProjectWithRelations.id,
    projectNumber: dbProjectWithRelations.project_number ?? undefined,
    name: dbProjectWithRelations.name,
    address: dbProjectWithRelations.address,
    designer: dbProjectWithRelations.designer,
    projectManager: dbProjectWithRelations.project_manager,
    userId: dbProjectWithRelations.user_id,
    createdAt: dbProjectWithRelations.created_at,
    updatedAt: dbProjectWithRelations.updated_at,

    // --- Map the included '...Obj' relations ---
    // Use the EXACT keys returned by your API route
    engineer: mapCompany(dbProjectWithRelations.engineerObj), // <-- Changed key
    masonryCompany: mapCompany(dbProjectWithRelations.masonryCompanyObj), // <-- Changed key
    architect: mapCompany(dbProjectWithRelations.architectObj), // <-- Changed key
    owner: mapCompany(dbProjectWithRelations.ownerObj), // <-- Changed key
    // Map other direct project fields if needed
  };
};

// Original mapping function (keep if used by getProjects or other functions)
const mapDbProjectToProject = (dbProject: any): Project => ({
  id: dbProject.id,
  projectNumber: dbProject.project_number,
  name: dbProject.name,
  address: dbProject.address,
  masonryCompany: dbProject.masonry_company,
  architect: dbProject.architect,
  engineer: dbProject.engineer,
  owner: dbProject.owner,
  masonryCompanyId: dbProject.masonry_company_id,
  architectId: dbProject.architect_id,
  engineerId: dbProject.engineer_id,
  ownerId: dbProject.owner_id,
  masonryCompanyObj: dbProject.masonryCompanyObj || undefined, // Keep if needed by Project type
  architectObj: dbProject.architectObj || undefined,
  engineerObj: dbProject.engineerObj || undefined,
  ownerObj: dbProject.ownerObj || undefined,
  designer: dbProject.designer,
  projectManager: dbProject.project_manager,
  userId: dbProject.user_id,
  createdAt: dbProject.created_at,
  updatedAt: dbProject.updated_at,
});

// Project services
export const projectService = {
  // getProjects - unchanged, assuming it returns basic Project type
  async getProjects(userId: string): Promise<Project[]> {
    try {
      console.log('Fetching projects for userId:', userId);
      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          /* ignore */
        }
        throw new Error(`Failed to fetch projects: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('Projects data received:', data);
      return data.map(mapDbProjectToProject); // Still uses basic mapping
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  },

  // createProject - unchanged, assuming it returns basic Project type
  async createProject(
    projectData: ProjectFormData,
    userId: string,
  ): Promise<Project> {
    try {
      const apiData = {
        projectNumber: projectData.projectNumber,
        name: projectData.name,
        address: projectData.address,
        masonryCompany: projectData.masonryCompany,
        architect: projectData.architect,
        engineer: projectData.engineer,
        owner: projectData.owner,
        masonryCompanyId: projectData.masonryCompanyId,
        architectId: projectData.architectId,
        engineerId: projectData.engineerId,
        ownerId: projectData.ownerId,
        designer: projectData.designer,
        projectManager: projectData.projectManager,
      };

      console.log(
        'Creating project for userId:',
        userId,
        'with data:',
        apiData,
      );

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          /* ignore */
        }
        throw new Error(`Failed to create project: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log('Project created successfully:', responseData);
      return mapDbProjectToProject(responseData); // Still uses basic mapping
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  },

  // Get a specific project - Uses updated mapping
  async getProject(projectId: string): Promise<EnrichedProjectData> {
    try {
      console.log('Fetching project with ID:', projectId);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          /* ignore */
        }
        throw new Error(`Failed to fetch project: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('Enriched project data received from API:', data); // Log raw API data
      // Use the mapping function updated for '...Obj' keys
      const mappedData = mapDbProjectToEnrichedProject(data);
      console.log('Mapped data for client:', mappedData); // Log mapped data
      return mappedData;
    } catch (error) {
      console.error('Error in getProject:', error);
      throw error;
    }
  },

  // updateProject - unchanged, assuming it returns basic Project type
  async updateProject(
    projectId: string,
    projectData: Partial<ProjectFormData>,
  ): Promise<Project> {
    try {
      console.log(
        'Updating project with ID:',
        projectId,
        'with data:',
        projectData,
      );

      const response = await fetch(`/api/projects/update/${projectId}`, {
        method: 'POST', // Consider PUT/PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          /* ignore */
        }
        throw new Error(`Failed to update project: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log('Project updated successfully:', responseData);
      return mapDbProjectToProject(responseData); // Still uses basic mapping
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  },

  // deleteProject - unchanged
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      console.log('Deleting project with ID:', projectId);

      const response = await fetch(`/api/projects/remove/${projectId}`, {
        method: 'POST', // Consider DELETE
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          /* ignore */
        }
        throw new Error(`Failed to delete project: ${errorMessage}`);
      }

      console.log('Project deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  },
};