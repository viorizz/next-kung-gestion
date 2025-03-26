// app/api/pdf-templates/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/pdf-templates?manufacturer=...&productType=...
export async function GET(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Get query parameters for filtering
    const { searchParams } = request.nextUrl;
    const manufacturer = searchParams.get('manufacturer');
    const productType = searchParams.get('productType');

    let query = supabase
      .from('pdf_templates')
      .select('*')
      .eq('user_id', userId); // Filter by authenticated user

    // Apply filters if provided
    if (manufacturer) {
      query = query.eq('manufacturer', manufacturer);
    }
    if (productType) {
      // Assuming DB column is product_type
      query = query.eq('product_type', productType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/pdf-templates
export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // Basic validation (add more specific validation if needed)
    if (!body.manufacturer || !body.productType || !body.pdfUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('pdf_templates')
      .insert({
        manufacturer: body.manufacturer,
        product_type: body.productType, // Map to snake_case
        pdf_url: body.pdfUrl, // Map to snake_case
        user_id: userId, // Associate with the authenticated user
        field_mapping: body.fieldMapping || null, // Map to snake_case, default null
      })
      .select() // Select the newly created row
      .single(); // Expect only one row

    if (error) {
      console.error('Supabase POST error:', error);
      // Handle specific errors like unique constraint violations if necessary
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 }); // Return created data with 201 status
  } catch (error: any) {
    console.error('POST Error:', error);
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}