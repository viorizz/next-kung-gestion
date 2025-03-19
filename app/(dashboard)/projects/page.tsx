'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ui/projectcard';
import { ProjectDialog } from '@/components/ui/projectdialog';
import { PlusIcon, Loader2 } from 'lucide-react';
import { projectService } from '@/lib/services/projectService';
import { Project, ProjectFormData } from '@/types/project';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProjectsPage() {
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    // Fetch projects when user is loaded
    if (isLoaded && user) {
      fetchProjects();
    }
  }, [isLoaded, user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await projectService.getProjects(user.id);
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('An error occurred while loading projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async (formData: ProjectFormData | Partial<Project>) => {
    if (!user) return;
    
    try {
      // Convert to ProjectFormData if needed
      const projectFormData: ProjectFormData = {
        projectNumber: formData.projectNumber || '',
        name: formData.name || '',
        address: formData.address || '',
        designer: formData.designer || '',
        projectManager: formData.projectManager || '',
        masonryCompany: formData.masonryCompany || null,
        architect: formData.architect || null,
        engineer: formData.engineer || null,
        owner: formData.owner || null
      };
      
      await projectService.createProject(projectFormData, user.id);
      toast.success('Project added successfully');
      setIsAddDialogOpen(false);
      fetchProjects(); // Refresh the list
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('An error occurred while adding the project');
    }
  };

  const handleEditProject = async (project: Project | Partial<Project>) => {
    if (!user) return;
    
    // Make sure we have an ID (should always be the case for editing)
    if (!('id' in project) || !project.id) {
      console.error('Cannot update project without ID');
      toast.error('An error occurred: Missing project ID');
      return;
    }
    
    console.log('Editing project:', project);
    
    try {
      // Use a non-null assertion since we've checked above
      const projectId: string = project.id;
      
      const updateData: Partial<ProjectFormData> = {
        projectNumber: project.projectNumber,
        name: project.name,
        address: project.address,
        designer: project.designer,
        projectManager: project.projectManager,
        masonryCompany: project.masonryCompany,
        architect: project.architect,
        engineer: project.engineer,
        owner: project.owner
      };
      
      await projectService.updateProject(projectId, updateData);
      
      toast.success('Project updated successfully');
      setEditingProject(null);
      fetchProjects(); // Refresh the list
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('An error occurred while updating the project');
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link> / Projects
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New Project
        </Button>
      </div>
      
      {/* Project Cards */}
      {projects.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            No projects found. Start by creating a new project.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onEditClick={() => handleEditClick(project)} 
            />
          ))}
        </div>
      )}
      
      {/* Add Project Dialog */}
      <ProjectDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddProject}
      />
      
      {/* Edit Project Dialog */}
      {editingProject && (
        <ProjectDialog 
          open={editingProject !== null}
          onOpenChange={(open: boolean) => !open && setEditingProject(null)}
          onSave={handleEditProject}
          project={editingProject}
        />
      )}
    </div>
  );
}