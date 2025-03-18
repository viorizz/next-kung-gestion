// lib/services/companyService.ts
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
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
const mapDbCompanyToCompany = (dbCompany: DbCompany | any): Company => ({
  id: dbCompany.id,
  name: dbCompany.name,
  street: dbCompany.street,
  postalCode: dbCompany.postal_code,
  city: dbCompany.city,
  country: dbCompany.country || 'Suisse',
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
  // Get all companies for a user
  async getCompanies(userId: string): Promise<Company[]> {
    try {
      console.log('Fetching companies for userId:', userId);
      const response = await fetch('/api/companies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // More informative error handling
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to fetch companies: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('Companies data received:', data);
      return data.map(mapDbCompanyToCompany);
    } catch (error) {
      console.error('Error in getCompanies:', error);
      throw error;
    }
  },

  // Create a new company
  async createCompany(companyData: CompanyFormData, userId: string): Promise<Company> {
    try {
      // Convert frontend model to database model format expected by the API
      const apiData = {
        name: companyData.name,
        street: companyData.street,
        postal_code: companyData.postalCode, // Note the field name conversion
        city: companyData.city,
        country: companyData.country,
        phone: companyData.phone || null,
        email: companyData.email || null,
        type: companyData.type
      };
      
      console.log('Creating company for userId:', userId, 'with data:', apiData);
      
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      // More robust error handling
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const textError = await response.text().catch(() => '');
          console.error('API text error response:', textError);
        }
        throw new Error(`Failed to create company: ${errorMessage}`);
      }
      
      // Try to parse JSON response, but handle case where it might not be JSON
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${text}`);
      }
      
      console.log('Company created successfully:', responseData);
      return mapDbCompanyToCompany(responseData);
    } catch (error) {
      console.error('Error in createCompany:', error);
      throw error;
    }
  },

  // Get companies by type
  async getCompaniesByType(type: string, userId: string): Promise<Company[]> {
    try {
      console.log(`Fetching companies of type '${type}' for userId:`, userId);
      const allCompanies = await this.getCompanies(userId);
      return allCompanies.filter(company => company.type === type);
    } catch (error) {
      console.error('Error in getCompaniesByType:', error);
      throw error;
    }
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