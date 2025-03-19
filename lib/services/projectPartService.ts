// lib/services/projectPartService.ts
import { ProjectPart, ProjectPartFormData } from '@/types/projectPart';

// Helper function to convert database project part to frontend project part
const mapDbProjectPartToProjectPart = (dbProjectPart: any): ProjectPart => ({
  id: dbProjectPart.id,
  projectId: dbProjectPart.project_id,
  partNumber: dbProjectPart.part_number,
  name: dbProjectPart.name,
  designer: dbProjectPart.designer,
  projectManager: dbProjectPart.project_manager,
  createdAt: dbProjectPart.created_at,
  updatedAt: dbProjectPart.updated_at
});

// Project Part services
export const projectPartService = {
  // Get all project parts for a specific project
  async getProjectParts(projectId: string): Promise<ProjectPart[]> {
    try {
      console.log('Fetching project parts for projectId:', projectId);
      const response = await fetch(`/api/project-parts?projectId=${projectId}`, {
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
        throw new Error(`Failed to fetch project parts: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Project parts data received:', data);
      return data.map(mapDbProjectPartToProjectPart);
    } catch (error) {
      console.error('Error in getProjectParts:', error);
      throw error;
    }
  },

  // Create a new project part
  async createProjectPart(partData: ProjectPartFormData): Promise<ProjectPart> {
    try {
      // Convert frontend model to database model format expected by the API
      const apiData = {
        projectId: partData.projectId,
        partNumber: partData.partNumber,
        name: partData.name,
        designer: partData.designer,
        projectManager: partData.projectManager
      };
      
      console.log('Creating project part for project:', partData.projectId, 'with data:', apiData);
      
      const response = await fetch('/api/project-parts', {
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
        throw new Error(`Failed to create project part: ${errorMessage}`);
      }
      
      // Parse JSON response
      const responseData = await response.json();
      console.log('Project part created successfully:', responseData);
      return mapDbProjectPartToProjectPart(responseData);
    } catch (error) {
      console.error('Error in createProjectPart:', error);
      throw error;
    }
  },

  // Get a specific project part
  async getProjectPart(partId: string): Promise<ProjectPart> {
    try {
      console.log('Fetching project part with ID:', partId);
      const response = await fetch(`/api/project-parts/${partId}`, {
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
        throw new Error(`Failed to fetch project part: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Project part data received:', data);
      return mapDbProjectPartToProjectPart(data);
    } catch (error) {
      console.error('Error in getProjectPart:', error);
      throw error;
    }
  },

  // Update a project part
  async updateProjectPart(partId: string, partData: Partial<ProjectPartFormData>): Promise<ProjectPart> {
    try {
      console.log('Updating project part with ID:', partId, 'with data:', partData);
      
      const response = await fetch(`/api/project-parts/update/${partId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partData),
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
        throw new Error(`Failed to update project part: ${errorMessage}`);
      }
      
      // Parse JSON response
      const responseData = await response.json();
      console.log('Project part updated successfully:', responseData);
      return mapDbProjectPartToProjectPart(responseData);
    } catch (error) {
      console.error('Error in updateProjectPart:', error);
      throw error;
    }
  },

  // Delete a project part
  async deleteProjectPart(partId: string): Promise<boolean> {
    try {
      console.log('Deleting project part with ID:', partId);
      
      const response = await fetch(`/api/project-parts/remove/${partId}`, {
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
        throw new Error(`Failed to delete project part: ${errorMessage}`);
      }
      
      console.log('Project part deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteProjectPart:', error);
      throw error;
    }
  }
};