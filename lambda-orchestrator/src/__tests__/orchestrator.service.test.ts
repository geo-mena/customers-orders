import { OrchestratorService } from '../services/orchestratorService';
import { CustomersApiClient } from '../services/customersApiClient';
import { OrdersApiClient } from '../services/ordersApiClient';

jest.mock('../services/customersApiClient');
jest.mock('../services/ordersApiClient');

describe('OrchestratorService', () => {
  let orchestrator: OrchestratorService;
  let mockCustomersClient: jest.Mocked<CustomersApiClient>;
  let mockOrdersClient: jest.Mocked<OrdersApiClient>;

  beforeEach(() => {
    mockCustomersClient = new CustomersApiClient('http://localhost:3001', 'token') as jest.Mocked<CustomersApiClient>;
    mockOrdersClient = new OrdersApiClient('http://localhost:3002', 'token') as jest.Mocked<OrdersApiClient>;
    orchestrator = new OrchestratorService(mockCustomersClient, mockOrdersClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAndConfirmOrder', () => {
    it('should successfully create and confirm an order', async () => {
      const request = {
        customer_id: 1,
        items: [
          { product_id: 1, qty: 2 },
          { product_id: 2, qty: 1 },
        ],
        idempotency_key: 'test-key-123',
      };

      const mockCustomer = {
        id: 1,
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
      };

      const mockOrder = {
        id: 100,
        status: 'pending',
        total_cents: 5000,
        items: [
          { product_id: 1, qty: 2, unit_price_cents: 2000, subtotal_cents: 4000 },
          { product_id: 2, qty: 1, unit_price_cents: 1000, subtotal_cents: 1000 },
        ],
      };

      const mockConfirmedOrder = {
        ...mockOrder,
        status: 'confirmed',
      };

      mockCustomersClient.getCustomer = jest.fn().mockResolvedValue(mockCustomer);
      mockOrdersClient.createOrder = jest.fn().mockResolvedValue(mockOrder);
      mockOrdersClient.confirmOrder = jest.fn().mockResolvedValue(mockConfirmedOrder);

      const result = await orchestrator.createAndConfirmOrder(request);

      expect(result.success).toBe(true);
      expect(result.data?.order).toEqual(mockConfirmedOrder);
      expect(result.data?.customer).toEqual(mockCustomer);
      expect(mockCustomersClient.getCustomer).toHaveBeenCalledWith(1);
      expect(mockOrdersClient.createOrder).toHaveBeenCalledWith(1, request.items);
      expect(mockOrdersClient.confirmOrder).toHaveBeenCalledWith(100, 'test-key-123');
    });

    it('should return error if customer not found', async () => {
      const request = {
        customer_id: 999,
        items: [{ product_id: 1, qty: 2 }],
        idempotency_key: 'test-key-456',
      };

      mockCustomersClient.getCustomer = jest.fn().mockRejectedValue(new Error('Customer not found'));

      const result = await orchestrator.createAndConfirmOrder(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Customer not found');
      expect(mockOrdersClient.createOrder).not.toHaveBeenCalled();
      expect(mockOrdersClient.confirmOrder).not.toHaveBeenCalled();
    });

    it('should return error if order creation fails', async () => {
      const request = {
        customer_id: 1,
        items: [{ product_id: 1, qty: 2 }],
        idempotency_key: 'test-key-789',
      };

      const mockCustomer = { id: 1, name: 'Test Customer', email: 'test@example.com', phone: null };

      mockCustomersClient.getCustomer = jest.fn().mockResolvedValue(mockCustomer);
      mockOrdersClient.createOrder = jest.fn().mockRejectedValue(new Error('Insufficient stock'));

      const result = await orchestrator.createAndConfirmOrder(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient stock');
      expect(mockOrdersClient.confirmOrder).not.toHaveBeenCalled();
    });

    it('should return error if order confirmation fails', async () => {
      const request = {
        customer_id: 1,
        items: [{ product_id: 1, qty: 2 }],
        idempotency_key: 'test-key-abc',
      };

      const mockCustomer = { id: 1, name: 'Test Customer', email: 'test@example.com', phone: null };
      const mockOrder = { id: 100, status: 'pending', total_cents: 5000, items: [] };

      mockCustomersClient.getCustomer = jest.fn().mockResolvedValue(mockCustomer);
      mockOrdersClient.createOrder = jest.fn().mockResolvedValue(mockOrder);
      mockOrdersClient.confirmOrder = jest.fn().mockRejectedValue(new Error('Confirmation failed'));

      const result = await orchestrator.createAndConfirmOrder(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Confirmation failed');
    });

    it('should include customer and order in successful response', async () => {
      const request = {
        customer_id: 1,
        items: [{ product_id: 1, qty: 1 }],
        idempotency_key: 'test-key-xyz',
      };

      const mockCustomer = {
        id: 1,
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '5551234567',
      };

      const mockOrder = {
        id: 100,
        status: 'pending',
        total_cents: 5000,
        items: [{ product_id: 1, qty: 1, unit_price_cents: 5000, subtotal_cents: 5000 }],
      };

      const mockConfirmedOrder = {
        ...mockOrder,
        status: 'confirmed',
      };

      mockCustomersClient.getCustomer = jest.fn().mockResolvedValue(mockCustomer);
      mockOrdersClient.createOrder = jest.fn().mockResolvedValue(mockOrder);
      mockOrdersClient.confirmOrder = jest.fn().mockResolvedValue(mockConfirmedOrder);

      const result = await orchestrator.createAndConfirmOrder(request);

      expect(result.success).toBe(true);
      expect(result.data?.order).toEqual(mockConfirmedOrder);
      expect(result.data?.customer).toEqual(mockCustomer);
    });
  });
});
