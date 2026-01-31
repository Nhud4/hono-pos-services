export interface ProductsCategory {
  id: string;
  code: string;
  name: string;
  totalProduct: number;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductsCategoryRequest {
  name: string;
  status?: string;
  printTarget: string;
}

export interface UpdateProductsCategoryRequest {
  name: string;
  status: string;
  printTarget: string;
}

export interface ListProductsCategoryRequest {
  page: string;
  size: string;
  search?: string;
}
