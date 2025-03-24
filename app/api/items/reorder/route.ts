// app/api/items/reorder/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { orderListId, itemIds } = body;

    if (!orderListId || !itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json({ 
        error: 'Order list ID and an array of item IDs are required' 
      }, { status: 400 });
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
    
    // Get the order list to find the part_id and check status
    const { data: orderList, error: orderListError } = await supabase
      .from('order_lists')
      .select('part_id, status')
      .eq('id', orderListId)
      .single();
      
    if (orderListError) {
      console.error('Order list lookup error:', orderListError);
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
      console.error('Project part lookup error:', projectPartError);
      return NextResponse.json({ error: 'Project part not found' }, { status: 404 });
    }
    
    // Verify project ownership
    const { data: projectCheck, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectPart.project_id)
      .single();
      
    if (projectError) {
      console.error('Project lookup error:', projectError);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (projectCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this order list' }, 
        { status: 403 }
      );
    }
    
    // Update each item's position based on its index in the array
    // We multiply by 10 to leave room for future insertions between items
    const updates = [];
    for (let i = 0; i < itemIds.length; i++) {
      const position = (i + 1) * 10;
      
      updates.push(
        supabase
          .from('items')
          .update({ position, updated_at: new Date().toISOString() })
          .eq('id', itemIds[i])
          .eq('order_list_id', orderListId)
      );
    }
    
    // Execute all the updates in parallel
    await Promise.all(updates);
    
    return NextResponse.json({ success: true });
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