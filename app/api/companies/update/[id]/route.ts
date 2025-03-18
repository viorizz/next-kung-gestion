// app/api/companies/update/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextResponse, NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

// Using the simpler next/server types without explicit param typing
export async function POST(request: NextRequest) {
    // Extract the ID from the URL
    const urlParts = request.url.split('/');
    const id = urlParts[urlParts.length - 1];
  
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