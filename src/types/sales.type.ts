export interface Sale {
  id: string;
  productId: number;
  sales: number;
  income: number;
  grossIncome: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSaleRequest {
  productId: number;
  sales: number;
  income: number;
  grossIncome: number;
}

export interface UpdateSaleRequest {
  productId?: number;
  sales?: number;
  income?: number;
  grossIncome?: number;
}