// app/api/order-lists/route.ts
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

    // Get the partId from the search params if provided
    const { searchParams } = new URL(request.url);
    const partId = searchParams.get('partId');

    if (!partId) {
      return NextResponse.json({ error: 'Part ID is required' }, { status: 400 });
    }

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
    
    // Verify the user has access to the project part
    const { data: partCheck, error: partError } = await supabase
      .from('project_parts')
      .select('project_id')
      .eq('id', partId)
      .single();
      
    if (partError) {
      return NextResponse.json({ error: 'Project part not found' }, { status: 404 });
    }
    
    // Verify project ownership
    const { data: projectCheck, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', partCheck.project_id)
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
    
    // Fetch order lists for the given part
    const { data, error } = await supabase
      .from('order_lists')
      .select('*')
      .eq('part_id', partId)
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
    
    // Verify the user has access to the project part
    const { data: partCheck, error: partError } = await supabase
      .from('project_parts')
      .select('project_id')
      .eq('id', body.partId)
      .single();
      
    if (partError) {
      return NextResponse.json({ error: 'Project part not found' }, { status: 404 });
    }
    
    // Verify project ownership
    const { data: projectCheck, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', partCheck.project_id)
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
    const orderListData = {
      part_id: body.partId,
      list_number: body.listNumber,
      name: body.name,
      manufacturer: body.manufacturer,
      type: body.type,
      designer: body.designer,
      project_manager: body.projectManager,
      status: body.status || 'draft',
      submission_date: body.submissionDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the new order list
    const { data, error } = await supabase
      .from('order_lists')
      .insert(orderListData)
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