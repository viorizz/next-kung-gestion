'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ProjectPartCard } from '@/components/ui/projectpartcard';
import { ProjectPartDialog } from '@/components/ui/projectpartdialog';
import { PlusIcon, Loader2, ArrowLeft } from 'lucide-react';
import { projectPartService } from '@/lib/services/projectPartService';
import { projectService } from '@/lib/services/projectService';
import { ProjectPart, ProjectPartFormData } from '@/types/projectPart';
import { Project } from '@/types/project';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProjectPartsPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const { user, isLoaded } = useUser();
  const [projectParts, setProjectParts] = useState<ProjectPart[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProjectPart, setEditingProjectPart] = useState<ProjectPart | null>(null);

  useEffect(() => {
    // Fetch project and project parts when user is loaded
    if (isLoaded && user) {
      fetchProjectData();
    }
  }, [isLoaded, user, projectId]);

  const fetchProjectData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch project details first
      const projectData = await projectService.getProject(projectId);
      setProject(projectData);
      
      // Then fetch project parts
      const parts = await projectPartService.getProjectParts(projectId);
      setProjectParts(parts);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('An error occurred while loading project data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProjectPart = async (formData: ProjectPartFormData | Partial<ProjectPart>) => {
    if (!user || !project) return;
    
    try {
      // Ensure projectId is set
      const partData: ProjectPartFormData = {
        projectId: projectId,
        partNumber: formData.partNumber || '',
        name: formData.name || '',
        designer: formData.designer || '',
        projectManager: formData.projectManager || ''
      };
      
      await projectPartService.createProjectPart(partData);
      toast.success('Project part added successfully');
      setIsAddDialogOpen(false);
      fetchProjectData(); // Refresh the list
    } catch (error) {
      console.error('Error adding project part:', error);
      toast.error('An error occurred while adding the project part');
    }
  };

  const handleEditProjectPart = async (projectPart: ProjectPart | Partial<ProjectPart>) => {
    if (!user) return;
    
    // Make sure we have an ID (should always be the case for editing)
    if (!('id' in projectPart) || !projectPart.id) {
      console.error('Cannot update project part without ID');
      toast.error('An error occurred: Missing project part ID');
      return;
    }
    
    console.log('Editing project part:', projectPart);
    
    try {
      // Use a non-null assertion since we've checked above
      const partId: string = projectPart.id;
      
      const updateData: Partial<ProjectPartFormData> = {
        partNumber: projectPart.partNumber,
        name: projectPart.name,
        designer: projectPart.designer,
        projectManager: projectPart.projectManager
      };
      
      await projectPartService.updateProjectPart(partId, updateData);
      
      toast.success('Project part updated successfully');
      setEditingProjectPart(null);
      fetchProjectData(); // Refresh the list
    } catch (error) {
      console.error('Error updating project part:', error);
      toast.error('An error occurred while updating the project part');
    }
  };

  const handleEditClick = (projectPart: ProjectPart) => {
    setEditingProjectPart(projectPart);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            Project not found or you don't have access to it.
          </p>
          <Link href="/projects">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        {' / '}
        <Link href="/projects" className="hover:underline">Projects</Link>
        {' / '}
        <Link href={`/projects/${projectId}`} className="hover:underline">{project.name}</Link>
        {' / '}
        Parts
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Project Parts for {project.name}</h1>
          <p className="text-muted-foreground">Project #{project.projectNumber}</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Project Part
        </Button>
      </div>
      
      {/* Project Part Cards */}
      {projectParts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            No project parts found. Start by adding a new part.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projectParts.map(part => (
            <ProjectPartCard 
              key={part.id} 
              projectPart={part} 
              onEditClick={() => handleEditClick(part)} 
            />
          ))}
        </div>
      )}
      
      {/* Add Project Part Dialog */}
      <ProjectPartDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddProjectPart}
        projectId={projectId}
        defaultDesigner={project.designer}
        defaultProjectManager={project.projectManager}
      />
      
      {/* Edit Project Part Dialog */}
      {editingProjectPart && (
        <ProjectPartDialog 
          open={editingProjectPart !== null}
          onOpenChange={(open: boolean) => !open && setEditingProjectPart(null)}
          onSave={handleEditProjectPart}
          projectPart={editingProjectPart}
          projectId={projectId}
        />
      )}
    </div>
  );
}