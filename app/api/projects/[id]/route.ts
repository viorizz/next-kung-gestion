// app/api/projects/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

// --- Define expected shapes ---
// Type for the raw project data from Supabase 'projects' table
type DbProject = Database['public']['Tables']['projects']['Row'];
// Type for the company data from Supabase 'companies' table
type DbCompany = Database['public']['Tables']['companies']['Row'];

// Type for the final object returned by this API route
// It includes the project fields AND the nested company objects
interface ApiProjectResponse extends DbProject {
  masonryCompanyObj: DbCompany | null;
  architectObj: DbCompany | null;
  engineerObj: DbCompany | null;
  ownerObj: DbCompany | null;
}
// -----------------------------

export async function GET(
  request: NextRequest,
  context: { params: any },
) {
  const projectId = context.params.id;

  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
      );
    }

    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } },
    );

    // Fetch the project - explicitly type the result if needed, though Supabase might infer DbProject
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single<DbProject>(); // Explicitly type the expected row

    if (error) {
      console.error('Supabase error fetching project:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: error.message, details: error, code: error.code },
        { status: 400 },
      );
    }

    // Helper function to get company details
    const getCompanyById = async (
      companyId: string | null,
    ): Promise<DbCompany | null> => {
      if (!companyId) return null;
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single<DbCompany>(); // Explicitly type the expected row

      if (error) {
        console.warn(`Error fetching company ${companyId}:`, error);
        return null; // Return null on error, don't throw
      }
      return data;
    };

    // Fetch all referenced companies in parallel
    const [masonryCompanyObj, architectObj, engineerObj, ownerObj] =
      await Promise.all([
        getCompanyById(project.masonry_company_id),
        getCompanyById(project.architect_id),
        getCompanyById(project.engineer_id),
        getCompanyById(project.owner_id),
      ]);

    // Construct the final response object with the correct type
    // --- MODIFICATION HERE ---
    const enhancedProject: ApiProjectResponse = {
      ...project, // Spread the original project fields
      // Add the fetched company objects
      masonryCompanyObj,
      architectObj,
      engineerObj,
      ownerObj,
    };
    // -------------------------

    return NextResponse.json(enhancedProject);
  } catch (error) {
    console.error('Unhandled error in API route:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}