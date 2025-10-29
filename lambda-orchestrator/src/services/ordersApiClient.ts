import axios, { AxiosInstance } from 'axios';
import { Order, CreateOrderItem, ApiResponse } from '../types/index.js';

export class OrdersApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, serviceToken: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceToken}`,
      },
      timeout: 10000,
    });
  }

  async createOrder(customerId: number, items: CreateOrderItem[]): Promise<Order> {
    try {
      const response = await this.client.post<ApiResponse<Order>>('/orders', {
        customer_id: customerId,
        items,
      });

      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to create order');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      console.error('Error creating order:', error.message);
      throw new Error('Orders service unavailable');
    }
  }

  async confirmOrder(orderId: number, idempotencyKey: string): Promise<Order> {
    try {
      const response = await this.client.post<ApiResponse<Order>>(
        `/orders/${orderId}/confirm`,
        {},
        {
          headers: {
            'X-Idempotency-Key': idempotencyKey,
          },
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to confirm order');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      console.error('Error confirming order:', error.message);
      throw new Error('Orders service unavailable');
    }
  }
}
