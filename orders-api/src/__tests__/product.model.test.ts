import { ProductModel } from '../models/product';
import { pool } from '../config/database';

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn(),
  },
}));

describe('ProductModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: 1,
        sku: 'TEST-001',
        name: 'Test Product',
        price_cents: 9999,
        stock: 100,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pool.execute as jest.Mock).mockResolvedValue([[mockProduct], []]);

      const result = await ProductModel.findById(1);

      expect(result).toEqual(mockProduct);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE id = ?',
        [1]
      );
    });

    it('should return null if product not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[], []]);

      const result = await ProductModel.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findBySku', () => {
    it('should return a product by SKU', async () => {
      const mockProduct = {
        id: 1,
        sku: 'PROD-ABC-123',
        name: 'Product ABC',
        price_cents: 5000,
        stock: 50,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pool.execute as jest.Mock).mockResolvedValue([[mockProduct], []]);

      const result = await ProductModel.findBySku('PROD-ABC-123');

      expect(result).toEqual(mockProduct);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE sku = ?',
        ['PROD-ABC-123']
      );
    });

    it('should return null if product not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[], []]);

      const result = await ProductModel.findBySku('NOT-FOUND');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const newProductData = {
        sku: 'NEW-001',
        name: 'New Product',
        price_cents: 4999,
        stock: 50,
      };

      const mockResult = { insertId: 1 };
      const mockProduct = {
        id: 1,
        ...newProductData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pool.execute as jest.Mock)
        .mockResolvedValueOnce([mockResult, []])
        .mockResolvedValueOnce([[mockProduct], []]);

      const result = await ProductModel.create(newProductData);

      expect(result.id).toBe(1);
      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO products (sku, name, price_cents, stock) VALUES (?, ?, ?, ?)',
        [newProductData.sku, newProductData.name, newProductData.price_cents, newProductData.stock]
      );
    });
  });

  describe('update', () => {
    it('should update product price and stock', async () => {
      const updateData = {
        price_cents: 7999,
        stock: 200,
      };

      const mockUpdatedProduct = {
        id: 1,
        sku: 'PROD-001',
        name: 'Product 1',
        price_cents: 7999,
        stock: 200,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pool.execute as jest.Mock)
        .mockResolvedValueOnce([{ affectedRows: 1 }, []])
        .mockResolvedValueOnce([[mockUpdatedProduct], []]);

      const result = await ProductModel.update(1, updateData);

      expect(result).toEqual(mockUpdatedProduct);
      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products SET'),
        expect.arrayContaining([7999, 200, 1])
      );
    });

    it('should return product unchanged if no updates provided', async () => {
      const mockProduct = {
        id: 1,
        sku: 'PROD-001',
        name: 'Product 1',
        price_cents: 5000,
        stock: 100,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (pool.execute as jest.Mock).mockResolvedValue([[mockProduct], []]);

      const result = await ProductModel.update(1, {});

      expect(result).toEqual(mockProduct);
    });
  });

  describe('decreaseStock', () => {
    it('should decrease product stock', async () => {
      const mockConnection = {
        execute: jest.fn().mockResolvedValue([{ affectedRows: 1 }, []]),
      };

      await ProductModel.decreaseStock(1, 5, mockConnection);

      expect(mockConnection.execute).toHaveBeenCalledWith(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [5, 1, 5]
      );
    });
  });

  describe('increaseStock', () => {
    it('should increase product stock', async () => {
      const mockConnection = {
        execute: jest.fn().mockResolvedValue([{ affectedRows: 1 }, []]),
      };

      await ProductModel.increaseStock(1, 10, mockConnection);

      expect(mockConnection.execute).toHaveBeenCalledWith(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [10, 1]
      );
    });
  });
});
