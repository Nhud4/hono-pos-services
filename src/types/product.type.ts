export interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  description: string;
  normalPrice: number;
  hpp: number;
  discount: number;
  discountType: string;
  stock: number;
  active: boolean;
  available: boolean;
  img: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductRequest {
  name: string;
  categoryId: string;
  description?: string;
  normalPrice: string;
  hpp: string;
  discount?: string;
  discountType?: string;
  stock: string;
  active: string
}

export interface UpdateProductRequest {
  name: string;
  categoryId: string;
  description?: string;
  normalPrice: string;
  hpp: string;
  discount?: string;
  discountType?: string;
  stock: string;
  active: string
}

export interface ListProductRequest {
  page: string;
  size: string;
  search?: string;
}
