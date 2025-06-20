// app/api/project-parts/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

// Let Next.js manage the types
export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  const partId = context.params.id;
  
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
    
    // Fetch the project part and ensure it belongs to a project owned by the current user
    const { data, error } = await supabase
      .from('project_parts')
      .select('*, projects!inner(user_id)')
      .eq('id', partId)
      .eq('projects.user_id', userId)
      .single();
      
    if (error) {
      console.error('Supabase error in API route:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project part not found' }, { status: 404 });
      }
      
      return NextResponse.json(
        { error: error.message, details: error, code: error.code }, 
        { status: 400 }
      );
    }
    
    // Remove the projects object from the response
    if (data) {
      const { projects, ...partData } = data;
      return NextResponse.json(partData);
    }
    
    return NextResponse.json({ error: 'Project part not found' }, { status: 404 });
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