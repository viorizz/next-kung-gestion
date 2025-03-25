// components/ui/field-mapping-editor.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { FieldMapping, FieldSource } from '@/types/pdfMapping';

interface FieldMappingEditorProps {
  mappings: FieldMapping[];
  onChange: (mappings: FieldMapping[]) => void;
  pdfFields?: string[]; // Optional list of detected PDF field names
}

export function FieldMappingEditor({ mappings, onChange, pdfFields = [] }: FieldMappingEditorProps) {
  const [localMappings, setLocalMappings] = useState<FieldMapping[]>(mappings);

  useEffect(() => {
    setLocalMappings(mappings);
  }, [mappings]);

  const handleAddMapping = () => {
    const newMapping: FieldMapping = {
      pdfField: '',
      source: 'project',
      field: '',
    };
    
    const updatedMappings = [...localMappings, newMapping];
    setLocalMappings(updatedMappings);
    onChange(updatedMappings);
  };

  const handleRemoveMapping = (index: number) => {
    const updatedMappings = [...localMappings];
    updatedMappings.splice(index, 1);
    setLocalMappings(updatedMappings);
    onChange(updatedMappings);
  };

  const handleMappingChange = (index: number, field: keyof FieldMapping, value: any) => {
    const updatedMappings = [...localMappings];
    updatedMappings[index] = { ...updatedMappings[index], [field]: value };
    setLocalMappings(updatedMappings);
    onChange(updatedMappings);
  };

  const sourceOptions: {value: FieldSource, label: string}[] = [
    { value: 'project', label: 'Project' },
    { value: 'part', label: 'Project Part' },
    { value: 'orderList', label: 'Order List' },
    { value: 'item', label: 'Item' },
    { value: 'custom', label: 'Custom' }
  ];

  const getFieldOptions = (source: FieldSource) => {
    switch(source) {
      case 'project':
        return [
          { value: 'name', label: 'Project Name' },
          { value: 'projectNumber', label: 'Project Number' },
          { value: 'address', label: 'Address' },
          { value: 'designer', label: 'Designer' },
          { value: 'projectManager', label: 'Project Manager' },
          // Add more project fields...
        ];
      case 'part':
        return [
          { value: 'name', label: 'Part Name' },
          { value: 'partNumber', label: 'Part Number' },
          { value: 'designer', label: 'Designer' },
          { value: 'projectManager', label: 'Project Manager' },
          // Add more part fields...
        ];
      case 'orderList':
        return [
          { value: 'listNumber', label: 'List Number' },
          { value: 'name', label: 'List Name' },
          { value: 'manufacturer', label: 'Manufacturer' },
          { value: 'type', label: 'Type' },
          { value: 'designer', label: 'Designer' },
          { value: 'projectManager', label: 'Project Manager' },
          // Add more orderList fields...
        ];
      case 'item':
        return [
          { value: 'article', label: 'Article' },
          { value: 'quantity', label: 'Quantity' },
          { value: 'type', label: 'Type' },
          // Add more item fields...
        ];
      case 'custom':
        return [
          { value: 'currentDate', label: 'Current Date' },
          // Add more custom fields...
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Field Mappings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {localMappings.map((mapping, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-3">
                <Label>PDF Field</Label>
                <Select
                  value={mapping.pdfField}
                  onValueChange={(value) => handleMappingChange(index, 'pdfField', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PDF field" />
                  </SelectTrigger>
                  <SelectContent>
                    {pdfFields.length > 0 ? (
                      pdfFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="manual" disabled>
                        No PDF fields detected
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {pdfFields.length === 0 && (
                <div className="col-span-3">
                  <Label>Custom PDF Field Name</Label>
                  <Input
                    value={mapping.pdfField}
                    onChange={(e) => handleMappingChange(index, 'pdfField', e.target.value)}
                    placeholder="Enter PDF field name"
                  />
                </div>
              )}
              <div className="col-span-3">
                <Label>Source</Label>
                <Select
                  value={mapping.source}
                  onValueChange={(value) => handleMappingChange(index, 'source', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label>Field</Label>
                <Select
                  value={mapping.field}
                  onValueChange={(value) => handleMappingChange(index, 'field', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFieldOptions(mapping.source).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveMapping(index)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={handleAddMapping} variant="outline">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Field Mapping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}