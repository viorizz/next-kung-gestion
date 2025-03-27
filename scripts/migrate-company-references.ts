// scripts/migrate-company-references.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Database } from '@/types/supabase';

// Load environment variables
dotenv.config();

async function migrateProjectCompanyReferences() {
  console.log('Starting migration of project company references...');

  // Get Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return;
  }
  
  const supabase = createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    { auth: { persistSession: false } }
  );
  
  // 1. Fetch all projects
  console.log('Fetching all projects...');
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*');
  
  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return;
  }
  
  console.log(`Found ${projects?.length || 0} projects`);
  
  // 2. Fetch all companies to create a name-to-id mapping
  console.log('Fetching all companies...');
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, name, type');
  
  if (companiesError) {
    console.error('Error fetching companies:', companiesError);
    return;
  }
  
  console.log(`Found ${companies?.length || 0} companies`);
  
  // Create a map of company names to their IDs
  const companyMap: Record<string, string> = {};
  companies?.forEach(company => {
    companyMap[company.name] = company.id;
  });
  
  // 3. Update each project with corresponding company IDs
  console.log('Updating projects...');
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const project of (projects || [])) {
    const updates: Record<string, any> = {};
    let hasUpdates = false;
    
    // Set engineer_id if engineer name exists and found in companies
    if (project.engineer && companyMap[project.engineer]) {
      updates.engineer_id = companyMap[project.engineer];
      hasUpdates = true;
      console.log(`Project ${project.id}: Linking engineer "${project.engineer}" to ID ${updates.engineer_id}`);
    } else if (project.engineer) {
      console.warn(`Project ${project.id}: Could not find company ID for engineer "${project.engineer}"`);
    }
    
    // Set architect_id if architect name exists and found in companies
    if (project.architect && companyMap[project.architect]) {
      updates.architect_id = companyMap[project.architect];
      hasUpdates = true;
      console.log(`Project ${project.id}: Linking architect "${project.architect}" to ID ${updates.architect_id}`);
    } else if (project.architect) {
      console.warn(`Project ${project.id}: Could not find company ID for architect "${project.architect}"`);
    }
    
    // Set masonry_company_id if masonry_company name exists and found in companies
    if (project.masonry_company && companyMap[project.masonry_company]) {
      updates.masonry_company_id = companyMap[project.masonry_company];
      hasUpdates = true;
      console.log(`Project ${project.id}: Linking masonry company "${project.masonry_company}" to ID ${updates.masonry_company_id}`);
    } else if (project.masonry_company) {
      console.warn(`Project ${project.id}: Could not find company ID for masonry company "${project.masonry_company}"`);
    }
    
    // Set owner_id if owner name exists and found in companies
    if (project.owner && companyMap[project.owner]) {
      updates.owner_id = companyMap[project.owner];
      hasUpdates = true;
      console.log(`Project ${project.id}: Linking owner "${project.owner}" to ID ${updates.owner_id}`);
    } else if (project.owner) {
      console.warn(`Project ${project.id}: Could not find company ID for owner "${project.owner}"`);
    }
    
    // Only update if there are changes to make
    if (hasUpdates) {
      try {
        const { error: updateError } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', project.id);
        
        if (updateError) {
          console.error(`Error updating project ${project.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`Updated project ${project.id} with company references`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`Exception updating project ${project.id}:`, error);
        errorCount++;
      }
    } else {
      console.log(`Skipping project ${project.id}: No company references to update`);
      skippedCount++;
    }
  }
  
  console.log('\nMigration completed:');
  console.log(`- ${updatedCount} projects updated`);
  console.log(`- ${skippedCount} projects skipped (no updates needed)`);
  console.log(`- ${errorCount} errors encountered`);
}

// Run the migration function
migrateProjectCompanyReferences()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });