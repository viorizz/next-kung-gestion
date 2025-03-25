// app/api/pdf-templates/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
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
    
    // Check template ownership
    const { data: templateCheck, error: checkError } = await supabase
      .from('pdf_templates')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    if (templateCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this template' }, 
        { status: 403 }
      );
    }
    
    // Delete the template
    const { error } = await supabase
      .from('pdf_templates')
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