// app/api/debug/route.ts
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

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing environment variables', 
          details: { 
            hasUrl: !!supabaseUrl, 
            hasServiceKey: !!supabaseServiceKey 
          } 
        }, 
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );
    
    // Test database connection by querying public schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
      
    if (schemaError) {
      return NextResponse.json(
        { 
          error: 'Database connection error', 
          details: schemaError 
        }, 
        { status: 500 }
      );
    }
    
    // Query for this specific user
    const { data: userData, error: userError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .limit(5);
    
    return NextResponse.json({
      success: true,
      connection: "Successful",
      userId: userId,
      userIdType: typeof userId,
      sample: schemaData,
      userCompanies: userData,
      userCompaniesCount: userData?.length || 0,
      userError: userError ? userError.message : null
    });
    
  } catch (error) {
    console.error('Error in DB test route:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}