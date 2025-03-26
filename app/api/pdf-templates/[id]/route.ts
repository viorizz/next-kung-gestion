// app/api/pdf-templates/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/pdf-templates/[id]
export async function PUT(request: NextRequest, context: { params: any }) {
  const id = context.params.id;
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
    const updates = await request.json();

    // Prevent updating certain fields directly if needed (e.g., userId)
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;
    delete updates.updatedAt;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // 1. Check template ownership first
    const { data: templateCheck, error: checkError } = await supabase
      .from('pdf_templates')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !templateCheck) {
      // Handle case where checkError is null but templateCheck is also null/undefined
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (templateCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this template' },
        { status: 403 }
      );
    }

    // 2. Prepare update data with snake_case keys
    const updateData: { [key: string]: any } = {};
    if (updates.hasOwnProperty('manufacturer')) {
      updateData.manufacturer = updates.manufacturer;
    }
    if (updates.hasOwnProperty('productType')) {
      updateData.product_type = updates.productType;
    }
    if (updates.hasOwnProperty('pdfUrl')) {
      updateData.pdf_url = updates.pdfUrl;
    }
    if (updates.hasOwnProperty('fieldMapping')) {
      // Allow setting fieldMapping to null explicitly
      updateData.field_mapping = updates.fieldMapping;
    }

    // Add timestamp update if your table supports it automatically or manually
    // updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length === 0) {
      // This might happen if only non-updatable fields were sent
      return NextResponse.json(
        { error: 'No valid fields to update provided' },
        { status: 400 }
      );
    }


    // 3. Perform the update
    const { data: updatedData, error: updateError } = await supabase
      .from('pdf_templates')
      .update(updateData)
      .eq('id', id)
      .select() // Select the updated row
      .single(); // Expect one row

    if (updateError) {
      console.error('Supabase PUT error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json(updatedData);
  } catch (error: any) {
    console.error('PUT Error:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


// DELETE /api/pdf-templates/[id] (Your existing function)
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
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Check template ownership
    const { data: templateCheck, error: checkError } = await supabase
      .from('pdf_templates')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !templateCheck) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (templateCheck.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this template' },
        { status: 403 }
      );
    }

    // Delete the template
    const { error } = await supabase.from('pdf_templates').delete().eq('id', id);

    if (error) {
      console.error('Supabase DELETE error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return 204 No Content for successful deletion is common practice
    return new NextResponse(null, { status: 204 });
    // Or return success: true if your service expects it
    // return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}