// app/(dashboard)/projects/[id]/parts/client.tsx
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
// Remove Project import if no longer needed directly
// import { Project } from '@/types/project';
import { toast } from 'sonner';
import Link from 'next/link';

// --- Ensure EnrichedProjectData is defined or imported correctly here ---
// (Make sure this matches the definition in projectService.ts and other clients)
interface Company {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
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
  engineer: Company | null;
  masonryCompany: Company | null;
  architect: Company | null;
  owner: Company | null;
}
// --------------------------------------------------------------------

// This component receives params directly in App Router
export default function ProjectPartsPage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = params.id;
  const { user, isLoaded } = useUser();
  const [projectParts, setProjectParts] = useState<ProjectPart[]>([]);

  // --- THIS IS THE CORRECTED LINE (Line 23 approx.) ---
  const [project, setProject] = useState<EnrichedProjectData | null>(null);
  // ----------------------------------------------------

  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProjectPart, setEditingProjectPart] =
    useState<ProjectPart | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjectData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user, projectId]);

  const fetchProjectData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch project details - returns EnrichedProjectData
      const projectData: EnrichedProjectData =
        await projectService.getProject(projectId);
      // This assignment is now correct
      setProject(projectData);

      // Then fetch project parts
      const parts = await projectPartService.getProjectParts(projectId);
      setProjectParts(parts);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('An error occurred while loading project data');
      setProject(null); // Reset state on error
      setProjectParts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProjectPart = async (
    formData: ProjectPartFormData | Partial<ProjectPart>,
  ) => {
    if (!user || !project) return; // project is EnrichedProjectData | null

    try {
      const partData: ProjectPartFormData = {
        projectId: projectId,
        partNumber: formData.partNumber || '',
        name: formData.name || '',
        // Use defaults from the enriched project data
        designer: formData.designer || project.designer || '',
        projectManager: formData.projectManager || project.projectManager || '',
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

  const handleEditProjectPart = async (
    projectPart: ProjectPart | Partial<ProjectPart>,
  ) => {
    if (!user) return;

    if (!('id' in projectPart) || !projectPart.id) {
      console.error('Cannot update project part without ID');
      toast.error('An error occurred: Missing project part ID');
      return;
    }

    console.log('Editing project part:', projectPart);

    try {
      const partId: string = projectPart.id;

      const updateData: Partial<ProjectPartFormData> = {
        partNumber: projectPart.partNumber,
        name: projectPart.name,
        designer: projectPart.designer,
        projectManager: projectPart.projectManager,
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

  // Check project after loading
  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            Project not found or you don't have access to it.
          </p>
          <Link href="/projects">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Now safe to access project
  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        {' / '}
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
        {' / '}
        <Link href={`/projects/${projectId}`} className="hover:underline">
          {project.name} {/* Safe access */}
        </Link>
        {' / '}
        Parts
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Project Parts for {project.name}
          </h1>
          <p className="text-muted-foreground">
            Project #{project.projectNumber || 'N/A'}
          </p>
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
          {projectParts.map((part) => (
            <ProjectPartCard
              key={part.id}
              projectPart={part}
              projectId={projectId} // Pass projectId
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
        defaultDesigner={project.designer} // Safe access
        defaultProjectManager={project.projectManager} // Safe access
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