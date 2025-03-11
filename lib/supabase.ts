// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';

export const getSupabaseClient = async () => {
  const { getToken } = auth();
  const supabaseToken = await getToken({ template: 'supabase' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseToken}`
      }
    }
  });
};