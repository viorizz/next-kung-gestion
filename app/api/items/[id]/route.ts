// app/api/items/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

export async function GET(
  request: NextRequest,
  context: { params: any }
) {
  const itemId = context.params.id;
  
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
    
    // First, get the item to get the order_list_id
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('order_list_id')
      .eq('id', itemId)
      .single();
      
    if (itemError) {
      console.error('Supabase error fetching item:', itemError);
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Then get the order list to find the part_id
    const { data: orderList, error: orderListError } = await supabase
      .from('order_lists')
      .select('part_id')
      .eq('id', item.order_list_id)
      .single();
      
    if (orderListError) {
      console.error('Order list lookup error:', orderListError);
      return NextResponse.json({ error: 'Order list not found' }, { status: 404 });
    }
    
    // Get the project_id from the project part
    const { data: projectPart, error: projectPartError } = await supabase
      .from('project_parts')
      .select('project_id')
      .eq('id', orderList.part_id)
      .single();
      
    if (projectPartError) {
      console.error('Project part lookup error:', projectPartError);
      return NextResponse.json({ error: 'Project part not found' }, { status: 404 });
    }
    
    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectPart.project_id)
      .single();
      
    if (projectError) {
      console.error('Project lookup error:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (project.user_id !== userId) {
      return NextResponse.json({ error: 'You do not have permission to access this item' }, { status: 403 });
    }
    
    // Now fetch the full item
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();
      
    if (error) {
      console.error('Supabase error in API route:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      
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