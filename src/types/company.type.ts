export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  img?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCompanyRequest {
  name: string;
  address?: string;
  phone?: string;
  img?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  address?: string;
  phone?: string;
  img?: string;
}
