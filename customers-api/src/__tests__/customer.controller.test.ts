import request from 'supertest';
import express from 'express';
import { CustomerController } from '../controllers/customerController';
import { CustomerModel } from '../models/customer';

jest.mock('../models/customer');

const app = express();
app.use(express.json());

app.get('/customers/:id', CustomerController.getById);
app.post('/customers', CustomerController.create);
app.put('/customers/:id', CustomerController.update);
app.delete('/customers/:id', CustomerController.delete);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message
    });
});

describe('CustomerController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /customers/:id', () => {
        it('should return a customer by id', async () => {
            const mockCustomer = {
                id: 1,
                name: 'Customer 1',
                email: 'customer1@example.com',
                phone: '1234567890',
                deleted_at: null,
                created_at: new Date(),
                updated_at: new Date()
            };

            (CustomerModel.findById as jest.Mock).mockResolvedValue(mockCustomer);

            const response = await request(app).get('/customers/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                id: 1,
                name: 'Customer 1',
                email: 'customer1@example.com',
                phone: '1234567890'
            });
            expect(CustomerModel.findById).toHaveBeenCalledWith(1);
        });

        it('should return 404 if customer not found', async () => {
            (CustomerModel.findById as jest.Mock).mockResolvedValue(null);

            const response = await request(app).get('/customers/999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Customer not found');
        });
    });

    describe('POST /customers', () => {
        it('should create a new customer', async () => {
            const newCustomer = {
                name: 'New Customer',
                email: 'new@example.com',
                phone: '5555555555'
            };

            const mockCreatedCustomer = {
                id: 1,
                ...newCustomer,
                deleted_at: null,
                created_at: new Date(),
                updated_at: new Date()
            };

            (CustomerModel.findByEmail as jest.Mock).mockResolvedValue(null);
            (CustomerModel.create as jest.Mock).mockResolvedValue(mockCreatedCustomer);

            const response = await request(app).post('/customers').send(newCustomer);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(1);
            expect(CustomerModel.findByEmail).toHaveBeenCalledWith(newCustomer.email);
            expect(CustomerModel.create).toHaveBeenCalledWith(newCustomer);
        });

        it('should return 409 if email already exists', async () => {
            const newCustomer = {
                name: 'New Customer',
                email: 'existing@example.com',
                phone: '5555555555'
            };

            (CustomerModel.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });

            const response = await request(app).post('/customers').send(newCustomer);

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Email already exists');
        });
    });

    describe('PUT /customers/:id', () => {
        it('should update a customer', async () => {
            const updateData = {
                name: 'Updated Customer',
                email: 'updated@example.com'
            };

            const existingCustomer = {
                id: 1,
                name: 'Original Customer',
                email: 'original@example.com',
                phone: '1234567890',
                deleted_at: null,
                created_at: new Date(),
                updated_at: new Date()
            };

            const mockUpdatedCustomer = {
                id: 1,
                name: 'Updated Customer',
                email: 'updated@example.com',
                phone: '1234567890',
                deleted_at: null,
                created_at: new Date(),
                updated_at: new Date()
            };

            (CustomerModel.findById as jest.Mock).mockResolvedValue(existingCustomer);
            (CustomerModel.findByEmail as jest.Mock).mockResolvedValue(null);
            (CustomerModel.update as jest.Mock).mockResolvedValue(mockUpdatedCustomer);

            const response = await request(app).put('/customers/1').send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                id: 1,
                name: 'Updated Customer',
                email: 'updated@example.com'
            });
            expect(CustomerModel.update).toHaveBeenCalledWith(1, updateData);
        });

        it('should return 404 if customer not found', async () => {
            (CustomerModel.findById as jest.Mock).mockResolvedValue(null);

            const response = await request(app).put('/customers/999').send({ name: 'Test' });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /customers/:id', () => {
        it('should delete a customer', async () => {
            (CustomerModel.delete as jest.Mock).mockResolvedValue(true);

            const response = await request(app).delete('/customers/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(CustomerModel.delete).toHaveBeenCalledWith(1);
        });

        it('should return 404 if customer not found', async () => {
            (CustomerModel.delete as jest.Mock).mockResolvedValue(false);

            const response = await request(app).delete('/customers/999');

            expect(response.status).toBe(404);
        });
    });
});
