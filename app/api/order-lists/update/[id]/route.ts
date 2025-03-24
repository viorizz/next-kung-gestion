// app/api/order-lists/update/[id]/route.ts
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
      return NextResponse.json({ error: 'You do not have permission to update this order list' }, { status: 403 });
    }
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Map frontend fields to database fields
    if (body.listNumber !== undefined) updateData.list_number = body.listNumber;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.manufacturer !== undefined) updateData.manufacturer = body.manufacturer;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.designer !== undefined) updateData.designer = body.designer;
    if (body.projectManager !== undefined) updateData.project_manager = body.projectManager;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.submissionDate !== undefined) updateData.submission_date = body.submissionDate;
    
    // Update the order list
    const { data, error } = await supabase
      .from('order_lists')
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