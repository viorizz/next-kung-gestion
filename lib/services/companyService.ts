// lib/services/companyService.ts
import { createClient } from '@supabase/supabase-js';
import { 
  Database, 
  DbCompany, 
  DbCompanyInsert, 
  DbCompanyUpdate 
} from '@/types/supabase';
import { Company, CompanyFormData } from '@/types/company';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper function to convert database company to frontend company
const mapDbCompanyToCompany = (dbCompany: DbCompany): Company => ({
  id: dbCompany.id,
  name: dbCompany.name,
  street: dbCompany.street,
  postalCode: dbCompany.postal_code,
  city: dbCompany.city,
  country: dbCompany.country,
  phone: dbCompany.phone || '',
  email: dbCompany.email || '',
  type: dbCompany.type
});

// Helper function to convert frontend company data to database format
const mapCompanyToDbCompany = (company: CompanyFormData): Omit<DbCompanyInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'> => ({
  name: company.name,
  street: company.street,
  postal_code: company.postalCode,
  city: company.city,
  country: company.country,
  phone: company.phone || null,
  email: company.email || null,
  type: company.type
});

// Company services
export const companyService = {
  // Create a new company
  // lib/services/companyService.ts
  // This update is focused only on the createCompany method to ensure it works with Clerk IDs

  // In your companyService object, update the createCompany method to:
  async createCompany(companyData: CompanyFormData, userId: string): Promise<Company> {
    const dbCompanyData = mapCompanyToDbCompany(companyData);
    
    // Ensure the userId is passed as a string
    const { data, error } = await supabase
      .from('companies')
      .insert([{ ...dbCompanyData, user_id: userId.toString() }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return mapDbCompanyToCompany(data);
  },

  // Similarly, update other methods that use userId:
  async getCompanies(userId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId.toString())
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data.map(mapDbCompanyToCompany);
  },

  // And the getCompaniesByType method:
  async getCompaniesByType(type: string, userId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('type', type)
      .eq('user_id', userId.toString())
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data.map(mapDbCompanyToCompany);
  },

  // Update a company
  async updateCompany(companyId: string, companyData: Partial<CompanyFormData>): Promise<Company> {
    // Convert frontend model to database model
    const dbUpdateData: Partial<DbCompanyUpdate> = {};
    
    if (companyData.name !== undefined) dbUpdateData.name = companyData.name;
    if (companyData.street !== undefined) dbUpdateData.street = companyData.street;
    if (companyData.postalCode !== undefined) dbUpdateData.postal_code = companyData.postalCode;
    if (companyData.city !== undefined) dbUpdateData.city = companyData.city;
    if (companyData.country !== undefined) dbUpdateData.country = companyData.country;
    if (companyData.phone !== undefined) dbUpdateData.phone = companyData.phone || null;
    if (companyData.email !== undefined) dbUpdateData.email = companyData.email || null;
    if (companyData.type !== undefined) dbUpdateData.type = companyData.type;
    
    const { data, error } = await supabase
      .from('companies')
      .update(dbUpdateData)
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;
    return mapDbCompanyToCompany(data);
  },

  // Delete a company
  async deleteCompany(companyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) throw error;
    return true;
  }
};