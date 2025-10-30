import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env.js';
import { Customer } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

class CustomersApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.customersApiBase,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.serviceToken}`
            },
            timeout: 5000
        });
    }

    async getCustomer(customerId: number): Promise<Customer> {
        try {
            const response = await this.client.get(`/internal/customers/${customerId}`);

            if (!response.data.success) {
                throw new AppError(404, 'Customer not found');
            }

            return response.data.data;
        } catch (error: any) {
            if (error instanceof AppError) {
                throw error;
            }

            if (error.response?.status === 404) {
                throw new AppError(404, 'Customer not found');
            }

            if (error.response?.status === 401) {
                throw new AppError(500, 'Service authentication failed');
            }

            console.error('Error calling Customers API:', error.message);
            throw new AppError(503, 'Customers service unavailable');
        }
    }
}

export const customersApiClient = new CustomersApiClient();
