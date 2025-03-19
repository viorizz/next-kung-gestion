// app/api/project-parts/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the projectId from the search params if provided
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
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
    
    // Verify the user has access to this project if projectId is provided
    if (projectId) {
      const { data: projectCheck, error: projectError } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();
        
      if (projectError) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      
      if (projectCheck.user_id !== userId) {
        return NextResponse.json(
          { error: 'You do not have permission to access this project' }, 
          { status: 403 }
        );
      }
    }
    
    // Set up the query
    let query = supabase
      .from('project_parts')
      .select('*, projects!inner(user_id)');
    
    // Filter by specific project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    // Always ensure we only get parts from projects the user owns
    query = query.eq('projects.user_id', userId);
    
    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) {
      console.error('Supabase error in API route:', error);
      return NextResponse.json(
        { error: error.message, details: error, code: error.code }, 
        { status: 400 }
      );
    }
    
    // Transform the data to remove the nested projects object
    const transformedData = data.map(part => {
      const { projects, ...rest } = part;
      return rest;
    });
    
    return NextResponse.json(transformedData);
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

export async function POST(request: Request) {
  try {
    // Verify authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
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
    
    // Verify the user has access to the project
    const { data: projectCheck, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', body.projectId)
      .single();
      
    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (projectCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to access this project' }, 
        { status: 403 }
      );
    }
    
    // Format the data for database insertion
    const partData = {
      project_id: body.projectId,
      part_number: body.partNumber,
      name: body.name,
      designer: body.designer,
      project_manager: body.projectManager,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the new project part
    const { data, error } = await supabase
      .from('project_parts')
      .insert(partData)
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error in API route:', error);
      return NextResponse.json(
        { error: error.message, details: error, code: error.code }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(data);
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