import { IdempotencyService } from '../services/idempotencyService';
import { pool } from '../config/database';

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn(),
  },
}));

jest.mock('../config/env', () => ({
  config: {
    idempotency: {
      expirationHours: 24,
    },
  },
}));

describe('IdempotencyService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return existing idempotency key if valid and not expired', async () => {
      const mockKey = {
        id: 1,
        key: 'test-key-123',
        target_type: 'order_confirmation',
        target_id: 100,
        status: 'completed',
        response_body: JSON.stringify({ orderId: 100, status: 'confirmed' }),
        created_at: new Date(),
        expires_at: new Date(Date.now() + 3600000),
      };

      (pool.execute as jest.Mock).mockResolvedValue([[mockKey], []]);

      const result = await IdempotencyService.check('test-key-123', 'order_confirmation');

      expect(result).toEqual(mockKey);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM idempotency_keys'),
        ['test-key-123', 'order_confirmation']
      );
    });

    it('should return null if idempotency key does not exist', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[], []]);

      const result = await IdempotencyService.check('new-key-456', 'order_confirmation');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new idempotency key', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }, []]);

      await IdempotencyService.create(
        'create-key-789',
        'order_creation',
        200,
        'processing',
        JSON.stringify({ orderId: 200 })
      );

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO idempotency_keys'),
        expect.arrayContaining(['create-key-789', 'order_creation', 200, 'processing'])
      );
    });
  });

  describe('update', () => {
    it('should update an existing idempotency key', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }, []]);

      await IdempotencyService.update(
        'update-key-999',
        'completed',
        JSON.stringify({ orderId: 300, status: 'confirmed' })
      );

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE idempotency_keys'),
        ['completed', JSON.stringify({ orderId: 300, status: 'confirmed' }), 'update-key-999']
      );
    });
  });
});
