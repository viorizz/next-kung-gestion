// app/api/order-lists/remove/[id]/route.ts
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
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );
    
    // First get the order list to find the part_id
    const { data: orderList, error: orderListError } = await supabase
      .from('order_lists')
      .select('part_id')
      .eq('id', id)
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
    
    // Verify user owns the project
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
        { error: 'You do not have permission to delete this order list' }, 
        { status: 403 }
      );
    }
    
    // Delete any associated items first (cascade delete would be better at the DB level)
    await supabase
      .from('items')
      .delete()
      .eq('order_list_id', id);
      
    // Delete the order list
    const { error } = await supabase
      .from('order_lists')
      .delete()
      .eq('id', id);
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}