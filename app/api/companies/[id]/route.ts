// app/api/companies/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
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
    const body = await req.json();
    
    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );
    
    // Check company ownership
    const { data: companyCheck, error: checkError } = await supabase
      .from('companies')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    if (companyCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this company' }, 
        { status: 403 }
      );
    }
    
    // Update data
    const updateData = {
      name: body.name,
      street: body.street,
      postal_code: body.postalCode,
      city: body.city,
      country: body.country || 'Suisse',
      phone: body.phone || null,
      email: body.email || null,
      type: body.type,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('companies')
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
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
    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );
    
    // Check company ownership
    const { data: companyCheck, error: checkError } = await supabase
      .from('companies')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    if (companyCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this company' }, 
        { status: 403 }
      );
    }
    
    // Delete the company
    const { error } = await supabase
      .from('companies')
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