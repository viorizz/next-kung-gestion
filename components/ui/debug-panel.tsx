'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { companyService } from '@/lib/services/companyService';

export function DebugPanel() {
  const { user, isLoaded } = useUser();
  const [debugOutput, setDebugOutput] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const runTest = async () => {
    if (!user) {
      addOutput('No user available');
      return;
    }

    try {
      // Test database connection directly
      addOutput('Testing direct database connection');
      const dbTestResponse = await fetch('/api/debug', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const dbTestData = await dbTestResponse.json();
      addOutput('DB test response status: ' + dbTestResponse.status);
      addOutput('DB test response data:', dbTestData);

      // Test direct API call
      addOutput('Making direct API request to /api/companies');
      const apiResponse = await fetch('/api/companies', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const apiData = await apiResponse.json();
      addOutput('API response status: ' + apiResponse.status);
      addOutput('API response data:', apiData);

      // Test service layer
      addOutput('Testing companyService.getCompanies()');
      const serviceData = await companyService.getCompanies(user.id);
      addOutput('Service layer response:', serviceData);

    } catch (error) {
      addOutput('Error during tests:', error);
    }
  };

  const addOutput = (message: string, data?: any) => {
    setDebugOutput(prev => [
      ...prev, 
      { 
        timestamp: new Date().toISOString(),
        message,
        data: data ? JSON.stringify(data, null, 2) : undefined
      }
    ]);
  };

  const clearOutput = () => {
    setDebugOutput([]);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <Button 
        variant="outline"
        className="fixed bottom-4 right-4 z-50"
        onClick={toggleVisibility}
      >
        Show Debug
      </Button>
    );
  }

  const createTestCompany = async () => {
    if (!user) {
      addOutput('No user available');
      return;
    }

    try {
      addOutput('Creating test company');
      const testCompany = {
        name: `Test Company ${new Date().toISOString().slice(11, 19)}`,
        street: 'Test Street 123',
        postalCode: '1000',
        city: 'Test City',
        country: 'Suisse',
        phone: '+41123456789',
        email: 'test@example.com',
        type: 'Engineer'
      };

      const result = await companyService.createCompany(testCompany, user.id);
      addOutput('Test company created:', result);
      
      // Refresh tests to show the new company
      await runTest();
    } catch (error) {
      addOutput('Error creating test company:', error);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50 bg-white shadow-lg opacity-90 hover:opacity-100 transition-opacity">
      <CardHeader className="py-2 px-4 flex flex-row items-center justify-between bg-slate-100">
        <CardTitle className="text-sm font-medium">Debug Panel</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearOutput}>Clear</Button>
          <Button variant="ghost" size="sm" onClick={toggleVisibility}>Hide</Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 text-xs">
        <div className="mb-2">
          <p>User ID: {user?.id || 'Not loaded'}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={runTest}>Run Tests</Button>
            <Button variant="outline" size="sm" onClick={createTestCompany}>Create Test Company</Button>
          </div>
        </div>
        
        {debugOutput.length > 0 ? (
          <div className="border rounded p-2 bg-slate-50 overflow-auto max-h-64">
            {debugOutput.map((item, i) => (
              <div key={i} className="mb-2 pb-2 border-b last:border-0">
                <div className="text-gray-500 text-[10px]">{item.timestamp}</div>
                <div>{item.message}</div>
                {item.data && (
                  <pre className="bg-slate-100 p-1 mt-1 rounded overflow-auto text-[10px]">
                    {item.data}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No output yet. Click "Run Tests".</p>
        )}
      </CardContent>
    </Card>
  );
}