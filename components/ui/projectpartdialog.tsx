'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectPart, ProjectPartFormData } from '@/types/projectPart';

// Field configuration for focusing
const fieldOrder = [
  'partNumber',
  'name',
  'designer',
  'projectManager',
];

interface ProjectPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (projectPart: ProjectPart | Partial<ProjectPart>) => void;
  projectPart?: ProjectPart;
  projectId: string;
  defaultDesigner?: string;
  defaultProjectManager?: string;
}

export function ProjectPartDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  projectPart,
  projectId,
  defaultDesigner = '',
  defaultProjectManager = ''
}: ProjectPartDialogProps) {
  const isEditing = !!projectPart;
  
  // Create refs for each input field
  const inputRefs = {
    partNumber: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    designer: useRef<HTMLInputElement>(null),
    projectManager: useRef<HTMLInputElement>(null),
  };
  
  const [formData, setFormData] = useState<Omit<ProjectPartFormData, 'projectId'>>({
    partNumber: '',
    name: '',
    designer: '',
    projectManager: '',
  });

  // Reset form when dialog opens/closes or project part changes
  useEffect(() => {
    if (projectPart) {
      console.log('Setting form data from project part:', projectPart);
      setFormData({
        partNumber: projectPart.partNumber,
        name: projectPart.name,
        designer: projectPart.designer,
        projectManager: projectPart.projectManager,
      });
    } else if (open) {
      // Reset form when opening for a new project part
      // Use default values from project for designer and projectManager
      setFormData({
        partNumber: '',
        name: '',
        designer: defaultDesigner,
        projectManager: defaultProjectManager,
      });
    }
  }, [projectPart, open, defaultDesigner, defaultProjectManager]);

  // Focus the first field when the dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the dialog is fully rendered
      setTimeout(() => {
        inputRefs.partNumber.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle tab and enter key to move between fields
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault(); // Prevent default tab behavior
      
      // Find the current field index
      const currentIndex = fieldOrder.indexOf(fieldName);
      
      // Determine the next field index
      const nextIndex = e.shiftKey 
        ? (currentIndex - 1 + fieldOrder.length) % fieldOrder.length // Go backwards with Shift+Tab
        : (currentIndex + 1) % fieldOrder.length; // Go forwards with Tab
      
      const nextField = fieldOrder[nextIndex];
      
      // Focus the next field
      inputRefs[nextField as keyof typeof inputRefs].current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Add the projectId to the form data
    const completeFormData = {
      ...formData,
      projectId: projectId
    };
    
    if (isEditing && projectPart) {
      console.log('Updating project part with ID:', projectPart.id);
      onSave({ ...completeFormData, id: projectPart.id });
    } else {
      console.log('Creating new project part for project ID:', projectId);
      onSave(completeFormData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Project Part: ${projectPart?.name}` : 'Add New Project Part'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="partNumber">Part Number*</Label>
            <Input
              id="partNumber"
              name="partNumber"
              value={formData.partNumber}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'partNumber')}
              ref={inputRefs.partNumber}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Part Name*</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'name')}
              ref={inputRefs.name}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designer">Designer*</Label>
              <Input
                id="designer"
                name="designer"
                value={formData.designer}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'designer')}
                ref={inputRefs.designer}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectManager">Project Manager*</Label>
              <Input
                id="projectManager"
                name="projectManager"
                value={formData.projectManager}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'projectManager')}
                ref={inputRefs.projectManager}
                required
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Create Project Part'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}