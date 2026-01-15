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
  createdBy?: string;
  transactionType: string;
  customerName: string;
  tableNumber: number;
  paymentType: string;
  paymentMethod?: string;
  paymentStatus: string;
  payment?: number;
}

export interface UpdateTransactionRequest {
  createdBy?: string;
  transactionType: string;
  customerName: string;
  tableNumber: number;
  paymentType: string;
  paymentMethod: string;
  paymentStatus: string;
  payment: number;
}

export interface OrderProduct {
  productId: number;
  qty: number;
  subtotal: number;
  notes?: string
  discount: number
}

export interface CreateOrderRequest {
  transactionDate: string;
  transactionType: string;
  deliveryType: string;
  subtotal: number;
  totalDiscount: number;
  ppn: number;
  bill: number;
  items: OrderProduct[]
}

export interface GetOrderRequest {
  id: string;
  role: string;
  username: string;
  name: string;
}

export interface OrderData {
  id: string | number
  code: string | null;
  transactionDate: string;
  createdBy: string;
  transactionType: string;
  deliveryType?: string;
  paymentType?: string;
  subtotal: number;
  totalDiscount: number;
  ppn: number;
  bill: number;
  items: OrderProduct[]
}