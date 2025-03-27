// app/api/projects/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  const projectId = context.params.id;
  
  try {
    // Verify authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );
    
    // Fetch the project and ensure it belongs to the current user
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Supabase error in API route:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      
      return NextResponse.json(
        { error: error.message, details: error, code: error.code }, 
        { status: 400 }
      );
    }
    
    // Enhance project with company details if IDs are available
    let enhancedProject = { ...project };
    
    // Helper function to get company details
    const getCompanyById = async (companyId: string | null) => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
        
      if (error) {
        console.warn(`Error fetching company ${companyId}:`, error);
        return null;
      }
      
      return data;
    };
    
    // Fetch all referenced companies in parallel
    const [
      masonryCompanyObj,
      architectObj,
      engineerObj,
      ownerObj
    ] = await Promise.all([
      getCompanyById(project.masonry_company_id),
      getCompanyById(project.architect_id),
      getCompanyById(project.engineer_id),
      getCompanyById(project.owner_id)
    ]);
    
    // Add company objects to enhanced project
    enhancedProject = {
      ...enhancedProject,
      masonryCompanyObj,
      architectObj,
      engineerObj,
      ownerObj
    };
    
    return NextResponse.json(enhancedProject);
  } catch (error) {
    console.error('Unhandled error in API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}