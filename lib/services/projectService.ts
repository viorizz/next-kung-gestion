// lib/services/projectService.ts
import { Project, ProjectFormData } from '@/types/project';

// Helper function to convert database project to frontend project
const mapDbProjectToProject = (dbProject: any): Project => ({
  id: dbProject.id,
  projectNumber: dbProject.project_number,
  name: dbProject.name,
  address: dbProject.address,
  // Map original string fields
  masonryCompany: dbProject.masonry_company,
  architect: dbProject.architect,
  engineer: dbProject.engineer,
  owner: dbProject.owner,
  // Map new UUID fields
  masonryCompanyId: dbProject.masonry_company_id,
  architectId: dbProject.architect_id,
  engineerId: dbProject.engineer_id,
  ownerId: dbProject.owner_id,
  // Map company objects if they exist
  masonryCompanyObj: dbProject.masonryCompanyObj || undefined,
  architectObj: dbProject.architectObj || undefined,
  engineerObj: dbProject.engineerObj || undefined,
  ownerObj: dbProject.ownerObj || undefined,
  // Other fields
  designer: dbProject.designer,
  projectManager: dbProject.project_manager,
  userId: dbProject.user_id,
  createdAt: dbProject.created_at,
  updatedAt: dbProject.updated_at
});

// Project services
export const projectService = {
  // Get all projects for a user
  async getProjects(userId: string): Promise<Project[]> {
    try {
      console.log('Fetching projects for userId:', userId);
      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to fetch projects: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Projects data received:', data);
      return data.map(mapDbProjectToProject);
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  },

  // Create a new project
  async createProject(projectData: ProjectFormData, userId: string): Promise<Project> {
    try {
      // Convert frontend model to database model format expected by the API
      const apiData = {
        projectNumber: projectData.projectNumber,
        name: projectData.name,
        address: projectData.address,
        // Include both string fields and ID fields
        masonryCompany: projectData.masonryCompany,
        architect: projectData.architect,
        engineer: projectData.engineer,
        owner: projectData.owner,
        // Add new ID fields
        masonryCompanyId: projectData.masonryCompanyId,
        architectId: projectData.architectId,
        engineerId: projectData.engineerId,
        ownerId: projectData.ownerId,
        designer: projectData.designer,
        projectManager: projectData.projectManager
      };
      
      console.log('Creating project for userId:', userId, 'with data:', apiData);
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to create project: ${errorMessage}`);
      }
      
      // Parse JSON response
      const responseData = await response.json();
      console.log('Project created successfully:', responseData);
      return mapDbProjectToProject(responseData);
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  },

  // Get a specific project
  async getProject(projectId: string): Promise<Project> {
    try {
      console.log('Fetching project with ID:', projectId);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to fetch project: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Project data received:', data);
      return mapDbProjectToProject(data);
    } catch (error) {
      console.error('Error in getProject:', error);
      throw error;
    }
  },

  // Update a project
  async updateProject(projectId: string, projectData: Partial<ProjectFormData>): Promise<Project> {
    try {
      console.log('Updating project with ID:', projectId, 'with data:', projectData);
      
      const response = await fetch(`/api/projects/update/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to update project: ${errorMessage}`);
      }
      
      // Parse JSON response
      const responseData = await response.json();
      console.log('Project updated successfully:', responseData);
      return mapDbProjectToProject(responseData);
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  },

  // Delete a project
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      console.log('Deleting project with ID:', projectId);
      
      const response = await fetch(`/api/projects/remove/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Handle errors
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to delete project: ${errorMessage}`);
      }
      
      console.log('Project deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  }
};