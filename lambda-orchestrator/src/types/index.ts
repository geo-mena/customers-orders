export interface CreateOrderItem {
    product_id: number;
    qty: number;
}

export interface CreateAndConfirmOrderRequest {
    customer_id: number;
    items: CreateOrderItem[];
    idempotency_key: string;
    correlation_id?: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

export interface OrderItem {
    product_id: number;
    qty: number;
    unit_price_cents: number;
    subtotal_cents: number;
}

export interface Order {
    id: number;
    status: string;
    total_cents: number;
    items: OrderItem[];
}

export interface OrchestratorResponse {
    success: boolean;
    correlationId?: string;
    data?: {
        customer: Customer;
        order: Order;
    };
    error?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
