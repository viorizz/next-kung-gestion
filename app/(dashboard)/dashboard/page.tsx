// app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Briefcase, 
  Building2, 
  Package,
  PlusCircle, 
  ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good morning');
    } else if (currentHour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {user?.firstName || 'User'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your Kung Gestion dashboard. Here's an overview of your projects and activities.
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <Link href="/projects">
                <Button variant="ghost" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Briefcase className="h-8 w-8" />
                  <span>New Project</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Link href="/manufacturers">
                <Button variant="ghost" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Building2 className="h-8 w-8" />
                  <span>Add Manufacturer</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Link href="/products">
                <Button variant="ghost" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Package className="h-8 w-8" />
                  <span>Browse Products</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Link href="/comparisons">
                <Button variant="ghost" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <ClipboardList className="h-8 w-8" />
                  <span>Compare Products</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* This would be populated from the database, but we're showing placeholders for now */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Office Building Renovation</CardTitle>
              <CardDescription>Started: March 1, 2025</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                5 parts | 3 order lists
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/projects/placeholder-id">
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Residential Complex</CardTitle>
              <CardDescription>Started: February 15, 2025</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                8 parts | 12 order lists
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/projects/placeholder-id-2">
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="border-dashed border-2 flex items-center justify-center p-6">
            <Link href="/projects">
              <Button variant="ghost" className="h-20 w-full flex flex-col gap-2">
                <PlusCircle className="h-8 w-8" />
                <span>Create New Project</span>
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground py-8">
              Your recent activity will appear here once you start using the platform.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}