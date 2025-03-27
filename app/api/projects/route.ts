// app/api/projects/route.ts
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

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      });
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
    
    // Fetch projects for the authenticated user
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
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
    
    // Format the data for database insertion with new fields
    const projectData = {
      project_number: body.projectNumber,
      name: body.name,
      address: body.address,
      // Original string fields
      masonry_company: body.masonryCompany || null,
      architect: body.architect || null, 
      engineer: body.engineer || null,
      owner: body.owner || null,
      // New UUID fields
      masonry_company_id: body.masonryCompanyId || null,
      architect_id: body.architectId || null,
      engineer_id: body.engineerId || null,
      owner_id: body.ownerId || null,
      // Other fields
      designer: body.designer,
      project_manager: body.projectManager,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the new project
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
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