import { Request } from 'express';

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface CreateCustomerData {
    name: string;
    email: string;
    phone?: string;
}

export interface UpdateCustomerData {
    name?: string;
    email?: string;
    phone?: string;
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

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
