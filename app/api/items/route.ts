// app/api/items/route.ts
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

    // Get the orderListId from the search params if provided
    const { searchParams } = new URL(request.url);
    const orderListId = searchParams.get('orderListId');

    if (!orderListId) {
      return NextResponse.json({ error: 'Order list ID is required' }, { status: 400 });
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
    
    // Verify the user has access to the order list
    // This involves a multi-stage check through the relationships
    
    // First get the order list to find the part_id
    const { data: orderList, error: orderListError } = await supabase
      .from('order_lists')
      .select('part_id')
      .eq('id', orderListId)
      .single();
      
    if (orderListError) {
      return NextResponse.json({ error: 'Order list not found' }, { status: 404 });
    }
    
    // Get the project_id from the project part
    const { data: projectPart, error: projectPartError } = await supabase
      .from('project_parts')
      .select('project_id')
      .eq('id', orderList.part_id)
      .single();
      
    if (projectPartError) {
      return NextResponse.json({ error: 'Project part not found' }, { status: 404 });
    }
    
    // Verify project ownership
    const { data: projectCheck, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectPart.project_id)
      .single();
      
    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (projectCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to access this order list' }, 
        { status: 403 }
      );
    }
    
    // Fetch items for the given order list
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('order_list_id', orderListId)
      .order('position', { ascending: true });
      
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

    if (!body.orderListId) {
      return NextResponse.json({ error: 'Order list ID is required' }, { status: 400 });
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
    
    // Verify the user has access to the order list
    // First get the order list to find the part_id
    const { data: orderList, error: orderListError } = await supabase
      .from('order_lists')
      .select('part_id, status')
      .eq('id', body.orderListId)
      .single();
      
    if (orderListError) {
      return NextResponse.json({ error: 'Order list not found' }, { status: 404 });
    }
    
    // Check if order list is in draft state
    if (orderList.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot modify items in a submitted order list' }, 
        { status: 403 }
      );
    }
    
    // Get the project_id from the project part
    const { data: projectPart, error: projectPartError } = await supabase
      .from('project_parts')
      .select('project_id')
      .eq('id', orderList.part_id)
      .single();
      
    if (projectPartError) {
      return NextResponse.json({ error: 'Project part not found' }, { status: 404 });
    }
    
    // Verify project ownership
    const { data: projectCheck, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectPart.project_id)
      .single();
      
    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (projectCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to access this order list' }, 
        { status: 403 }
      );
    }
    
    // Get the current highest position number to determine the new position
    const { data: highestPositionItem, error: positionError } = await supabase
      .from('items')
      .select('position')
      .eq('order_list_id', body.orderListId)
      .order('position', { ascending: false })
      .limit(1)
      .single();
      
    const newPosition = highestPositionItem ? highestPositionItem.position + 10 : 10;
    
    // Format the data for database insertion
    const itemData = {
      order_list_id: body.orderListId,
      position: body.position || newPosition, // Use provided position or calculate new one
      article: body.article || '',
      quantity: body.quantity || 1,
      type: body.type || '',
      specifications: body.specifications || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the new item
    const { data, error } = await supabase
      .from('items')
      .insert(itemData)
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