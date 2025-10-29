import { Request } from 'express';

export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'CANCELED';

export interface Product {
  id: number;
  sku: string;
  name: string;
  price_cents: number;
  stock: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductData {
  sku: string;
  name: string;
  price_cents: number;
  stock: number;
}

export interface UpdateProductData {
  price_cents?: number;
  stock?: number;
}

export interface Order {
  id: number;
  customer_id: number;
  status: OrderStatus;
  total_cents: number;
  created_at: Date;
  updated_at: Date;
  confirmed_at: Date | null;
  canceled_at: Date | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  unit_price_cents: number;
  subtotal_cents: number;
  created_at: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderItem {
  product_id: number;
  qty: number;
}

export interface CreateOrderData {
  customer_id: number;
  items: CreateOrderItem[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface IdempotencyKey {
  key: string;
  target_type: string;
  target_id: number | null;
  status: string;
  response_body: string | null;
  created_at: Date;
  expires_at: Date;
}

export interface AuthRequest extends Request {
  userId?: number;
  isServiceAuth?: boolean;
}

export interface PaginationParams {
  cursor?: number;
  limit?: number;
  search?: string;
}

export interface OrderListParams extends PaginationParams {
  status?: OrderStatus;
  from?: string;
  to?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
