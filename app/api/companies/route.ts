// app/api/companies/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Verify the user is authenticated
  const { userId } = auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get request body
  const body = await request.json();
  
  // Create Supabase client with service role key (has bypass RLS permissions)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key here, not anon key
    {
      auth: {
        persistSession: false
      }
    }
  );
  
  try {
    // Insert the company with user_id
    const { data, error } = await supabase
      .from('companies')
      .insert([{ ...body, user_id: userId }])
      .select()
      .single();
      
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating company:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}