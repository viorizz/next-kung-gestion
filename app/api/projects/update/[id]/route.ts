// app/api/projects/update/[id]/route.ts
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
    
    // Check project ownership
    const { data: projectCheck, error: checkError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    if (projectCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this project' }, 
        { status: 403 }
      );
    }
    
    // Update data - now including the company ID fields
    const updateData = {
      project_number: body.projectNumber,
      name: body.name,
      address: body.address,
      // Keep old string fields for backward compatibility
      masonry_company: body.masonryCompany || null,
      architect: body.architect || null,
      engineer: body.engineer || null,
      owner: body.owner || null,
      // Add new UUID reference fields
      masonry_company_id: body.masonryCompanyId || null,
      architect_id: body.architectId || null,
      engineer_id: body.engineerId || null,
      owner_id: body.ownerId || null,
      // Other fields
      designer: body.designer,
      project_manager: body.projectManager,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('projects')
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