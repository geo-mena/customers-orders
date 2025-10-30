import { CustomerModel } from '../models/customer';
import { pool } from '../config/database';

jest.mock('../config/database', () => ({
    pool: {
        execute: jest.fn()
    }
}));

describe('CustomerModel', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findById', () => {
        it('should return a customer by id', async () => {
            const mockCustomer = {
                id: 1,
                name: 'Test Customer',
                email: 'test@example.com',
                phone: '1234567890',
                deleted_at: null,
                created_at: new Date(),
                updated_at: new Date()
            };

            (pool.execute as jest.Mock).mockResolvedValue([[mockCustomer], []]);

            const result = await CustomerModel.findById(1);

            expect(result).toEqual(mockCustomer);
            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL',
                [1]
            );
        });

        it('should return null if customer not found', async () => {
            (pool.execute as jest.Mock).mockResolvedValue([[], []]);

            const result = await CustomerModel.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('findByEmail', () => {
        it('should return a customer by email', async () => {
            const mockCustomer = {
                id: 1,
                name: 'Test Customer',
                email: 'test@example.com',
                phone: '1234567890',
                deleted_at: null,
                created_at: new Date(),
                updated_at: new Date()
            };

            (pool.execute as jest.Mock).mockResolvedValue([[mockCustomer], []]);

            const result = await CustomerModel.findByEmail('test@example.com');

            expect(result).toEqual(mockCustomer);
        });

        it('should return null if customer not found', async () => {
            (pool.execute as jest.Mock).mockResolvedValue([[], []]);

            const result = await CustomerModel.findByEmail('notfound@example.com');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new customer', async () => {
            const newCustomerData = {
                name: 'New Customer',
                email: 'new@example.com',
                phone: '5555555555'
            };

            const mockResult = { insertId: 1 };
            const mockCustomer = {
                id: 1,
                ...newCustomerData,
                deleted_at: null,
                created_at: new Date(),
                updated_at: new Date()
            };

            (pool.execute as jest.Mock)
                .mockResolvedValueOnce([mockResult, []])
                .mockResolvedValueOnce([[mockCustomer], []]);

            const result = await CustomerModel.create(newCustomerData);

            expect(result.id).toBe(1);
            expect(pool.execute).toHaveBeenCalledWith(
                'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
                [newCustomerData.name, newCustomerData.email, newCustomerData.phone]
            );
        });
    });

    describe('update', () => {
        it('should update a customer', async () => {
            const updateData = {
                name: 'Updated Customer',
                email: 'updated@example.com'
            };

            const mockResult = { affectedRows: 1 };
            const mockUpdatedCustomer = {
                id: 1,
                name: 'Updated Customer',
                email: 'updated@example.com',
                phone: '1234567890',
                deleted_at: null,
                created_at: new Date(),
                updated_at: new Date()
            };

            (pool.execute as jest.Mock)
                .mockResolvedValueOnce([mockResult, []])
                .mockResolvedValueOnce([[mockUpdatedCustomer], []]);

            const result = await CustomerModel.update(1, updateData);

            expect(result).toEqual(mockUpdatedCustomer);
            expect(pool.execute).toHaveBeenCalled();
        });

        it('should return null if customer not found', async () => {
            const mockResult = { affectedRows: 0 };
            (pool.execute as jest.Mock).mockResolvedValue([mockResult, []]);

            const result = await CustomerModel.update(999, { name: 'Test' });

            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('should soft delete a customer', async () => {
            const mockResult = { affectedRows: 1 };
            (pool.execute as jest.Mock).mockResolvedValue([mockResult, []]);

            const result = await CustomerModel.delete(1);

            expect(result).toBe(true);
        });

        it('should return false if customer not found', async () => {
            const mockResult = { affectedRows: 0 };
            (pool.execute as jest.Mock).mockResolvedValue([mockResult, []]);

            const result = await CustomerModel.delete(999);

            expect(result).toBe(false);
        });
    });
});
