// app/api/items/update/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function POST(
  request: NextRequest,
  context: { params: any }
) {
  const id = context.params.id;
  
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const body = await request.json();
    
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );
    
    // First, get the item to get the order_list_id
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('order_list_id')
      .eq('id', id)
      .single();
      
    if (itemError) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Then get the order list to find the part_id and check status
    const { data: orderList, error: orderListError } = await supabase
      .from('order_lists')
      .select('part_id, status')
      .eq('id', item.order_list_id)
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
      return NextResponse.json(
        { error: 'You do not have permission to update this item' }, 
        { status: 403 }
      );
    }
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Map frontend fields to database fields
    if (body.position !== undefined) updateData.position = body.position;
    if (body.article !== undefined) updateData.article = body.article;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.specifications !== undefined) updateData.specifications = body.specifications;
    
    // Update the item
    const { data, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}