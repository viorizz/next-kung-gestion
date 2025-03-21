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
import { Project, ProjectFormData } from '@/types/project';
import { CompanyCombobox } from '@/components/ui/company-combobox';

// Field configuration for focusing
const fieldOrder = [
  'projectNumber',
  'name',
  'address',
  'designer',
  'projectManager',
  'masonryCompany',
  'architect',
  'engineer',
  'owner',
];

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: Project | Partial<Project>) => void;
  project?: Project;
}

export function ProjectDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  project 
}: ProjectDialogProps) {
  const isEditing = !!project;
  
  // Create refs for each input field (only for text inputs)
  const inputRefs = {
    projectNumber: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    address: useRef<HTMLInputElement>(null),
    designer: useRef<HTMLInputElement>(null),
    projectManager: useRef<HTMLInputElement>(null),
  };
  
  const [formData, setFormData] = useState<Omit<ProjectFormData, 'userId'>>({
    projectNumber: '',
    name: '',
    address: '',
    designer: '',
    projectManager: '',
    masonryCompany: null,
    architect: null,
    engineer: null,
    owner: null,
  });

  // Reset form when dialog opens/closes or project changes
  useEffect(() => {
    if (project) {
      console.log('Setting form data from project:', project);
      setFormData({
        projectNumber: project.projectNumber,
        name: project.name,
        address: project.address,
        designer: project.designer,
        projectManager: project.projectManager,
        masonryCompany: project.masonryCompany,
        architect: project.architect,
        engineer: project.engineer,
        owner: project.owner,
      });
    } else if (open) {
      // Reset form when opening for a new project
      setFormData({
        projectNumber: '',
        name: '',
        address: '',
        designer: '',
        projectManager: '',
        masonryCompany: null,
        architect: null,
        engineer: null,
        owner: null,
      });
    }
  }, [project, open]);

  // Focus the first field when the dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the dialog is fully rendered
      setTimeout(() => {
        inputRefs.projectNumber.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || null }));
  };
  
  const handleCompanyChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value || null }));
  };
  
  // Handle tab and enter key to move between fields (only for text inputs)
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
      
      // Focus the next field if it has a ref (text inputs)
      if (inputRefs[nextField as keyof typeof inputRefs]?.current) {
        inputRefs[nextField as keyof typeof inputRefs].current?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (isEditing && project) {
      console.log('Updating project with ID:', project.id);
      onSave({ ...formData, id: project.id });
    } else {
      console.log('Creating new project');
      onSave(formData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Project: ${project?.name}` : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectNumber">Project Number*</Label>
              <Input
                id="projectNumber"
                name="projectNumber"
                value={formData.projectNumber}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'projectNumber')}
                ref={inputRefs.projectNumber}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Project Name*</Label>
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address*</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'address')}
              ref={inputRefs.address}
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
          
          {/* 2x2 grid for company fields with comboboxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="masonryCompany">Masonry Company</Label>
              <CompanyCombobox
                value={formData.masonryCompany}
                onChange={(value) => handleCompanyChange('masonryCompany', value)}
                placeholder="Select company"
                companyType="Masonry"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="architect">Architect</Label>
              <CompanyCombobox
                value={formData.architect}
                onChange={(value) => handleCompanyChange('architect', value)}
                placeholder="Select architect"
                companyType="Architect"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="engineer">Engineer</Label>
              <CompanyCombobox
                value={formData.engineer}
                onChange={(value) => handleCompanyChange('engineer', value)}
                placeholder="Select engineer"
                companyType="Engineer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <CompanyCombobox
                value={formData.owner}
                onChange={(value) => handleCompanyChange('owner', value)}
                placeholder="Select owner"
                companyType="Contractor"
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
              {isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}