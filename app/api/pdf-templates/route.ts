// app/api/pdf-templates/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional filter by manufacturer and product type
    const { searchParams } = new URL(request.url);
    const manufacturer = searchParams.get('manufacturer');
    const productType = searchParams.get('productType');

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
    
    // Set up query
    let query = supabase
      .from('pdf_templates')
      .select('*')
      .eq('user_id', userId);
    
    // Apply filters if provided
    if (manufacturer) {
      query = query.eq('manufacturer', manufacturer);
    }
    
    if (productType) {
      query = query.eq('product_type', productType);
    }
    
    // Execute query
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) {
      return NextResponse.json(
        { error: error.message, details: error, code: error.code }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unhandled error in API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { manufacturer, productType, pdfUrl } = body;

    if (!manufacturer || !productType) {
      return NextResponse.json({ error: 'Manufacturer and product type are required' }, { status: 400 });
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
    
    // Check if a template already exists for this combination
    const { data: existingTemplate } = await supabase
      .from('pdf_templates')
      .select('id')
      .eq('manufacturer', manufacturer)
      .eq('product_type', productType)
      .eq('user_id', userId)
      .single();
      
    if (existingTemplate) {
      // Update existing template
      const { data, error } = await supabase
        .from('pdf_templates')
        .update({ 
          pdf_url: pdfUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTemplate.id)
        .select()
        .single();
        
      if (error) {
        return NextResponse.json(
          { error: error.message }, 
          { status: 400 }
        );
      }
      
      return NextResponse.json(data);
    } else {
      // Create new template
      const { data, error } = await supabase
        .from('pdf_templates')
        .insert({
          manufacturer,
          product_type: productType,
          pdf_url: pdfUrl,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        return NextResponse.json(
          { error: error.message }, 
          { status: 400 }
        );
      }
      
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Unhandled error in API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}