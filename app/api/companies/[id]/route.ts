// app/api/companies/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

// PATCH handler for updating companies
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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

    // Parse request body
    const body = await request.json();

    // Create Supabase client
    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );
    
    // First verify this company belongs to the user
    const { data: companyCheck, error: checkError } = await supabase
      .from('companies')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      console.error('Error checking company ownership:', checkError);
      return NextResponse.json(
        { error: 'Company not found' }, 
        { status: 404 }
      );
    }
    
    if (companyCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this company' }, 
        { status: 403 }
      );
    }
    
    // Prepare update data
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
    
    console.log('Updating company with data:', updateData);
    
    // Update the company
    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error in API route:', error);
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

// DELETE handler for deleting companies
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
    
    // First verify this company belongs to the user
    const { data: companyCheck, error: checkError } = await supabase
      .from('companies')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      console.error('Error checking company ownership:', checkError);
      return NextResponse.json(
        { error: 'Company not found' }, 
        { status: 404 }
      );
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
      console.error('Supabase error in API route:', error);
      return NextResponse.json(
        { error: error.message, details: error, code: error.code }, 
        { status: 400 }
      );
    }
    
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