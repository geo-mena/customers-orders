import { CustomersApiClient } from './customersApiClient.js';
import { OrdersApiClient } from './ordersApiClient.js';
import { CreateAndConfirmOrderRequest, OrchestratorResponse } from '../types/index.js';

export class OrchestratorService {
  constructor(
    private customersClient: CustomersApiClient,
    private ordersClient: OrdersApiClient
  ) {}

  async createAndConfirmOrder(
    request: CreateAndConfirmOrderRequest
  ): Promise<OrchestratorResponse> {
    try {
      console.log('Starting order orchestration', {
        customerId: request.customer_id,
        itemsCount: request.items.length,
        correlationId: request.correlation_id,
      });

      const customer = await this.customersClient.getCustomer(request.customer_id);
      console.log('Customer validated', { customerId: customer.id });

      const order = await this.ordersClient.createOrder(request.customer_id, request.items);
      console.log('Order created', { orderId: order.id, status: order.status });

      const confirmedOrder = await this.ordersClient.confirmOrder(
        order.id,
        request.idempotency_key
      );
      console.log('Order confirmed', { orderId: confirmedOrder.id, status: confirmedOrder.status });

      return {
        success: true,
        correlationId: request.correlation_id,
        data: {
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
          order: {
            id: confirmedOrder.id,
            status: confirmedOrder.status,
            total_cents: confirmedOrder.total_cents,
            items: confirmedOrder.items,
          },
        },
      };
    } catch (error: any) {
      console.error('Orchestration failed', {
        error: error.message,
        correlationId: request.correlation_id,
      });

      return {
        success: false,
        correlationId: request.correlation_id,
        error: error.message || 'Internal server error',
      };
    }
  }
}
