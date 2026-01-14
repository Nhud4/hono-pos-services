export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
}

export interface DetailProduct {
  data: Product
  error: Error | null
}