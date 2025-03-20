// app/api/projects/remove/[id]/route.ts
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
        { error: 'You do not have permission to delete this project' }, 
        { status: 403 }
      );
    }
    
    // Delete the project
    const { error } = await supabase
      .from('projects')
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