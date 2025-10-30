import axios, { AxiosInstance } from 'axios';
import { Customer, ApiResponse } from '../types/index.js';

export class CustomersApiClient {
    private client: AxiosInstance;

    constructor(baseURL: string, serviceToken: string) {
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${serviceToken}`
            },
            timeout: 5000
        });
    }

    async getCustomer(customerId: number): Promise<Customer> {
        try {
            const response = await this.client.get<ApiResponse<Customer>>(
                `/internal/customers/${customerId}`
            );

            if (!response.data.success || !response.data.data) {
                throw new Error('Customer not found');
            }

            return response.data.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error(`Customer with ID ${customerId} not found`);
            }

            console.error('Error calling Customers API:', error.message);
            throw new Error('Customers service unavailable');
        }
    }
}
