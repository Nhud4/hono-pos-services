export interface Transaction {
  id: string;
  code: string;
  transactionDate: string;
  createdBy: string;
  userId: number;
  transactionType: string;
  customerName?: string;
  deliveryType?: string;
  tableNumber?: string;
  paymentType?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal: number;
  totalDiscount: number;
  ppn: number;
  bill: number;
  payment: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTransactionRequest {
  code: string;
  transactionDate: string;
  createdBy: string;
  userId: number;
  transactionType: string;
  customerName?: string;
  deliveryType?: string;
  tableNumber?: string;
  paymentType?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal: number;
  totalDiscount: number;
  ppn: number;
  bill: number;
  payment: number;
}

export interface UpdateTransactionRequest {
  code?: string;
  transactionDate?: string;
  createdBy?: string;
  userId?: number;
  transactionType?: string;
  customerName?: string;
  deliveryType?: string;
  tableNumber?: string;
  paymentType?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal?: number;
  totalDiscount?: number;
  ppn?: number;
  bill?: number;
  payment?: number;
}