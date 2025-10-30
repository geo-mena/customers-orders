import { ResultSetHeader, RowDataPacket, PoolConnection } from 'mysql2/promise';
import { pool } from '../config/database.js';
import {
    Order,
    OrderWithItems,
    OrderItem,
    CreateOrderData,
    OrderListParams,
    OrderStatus
} from '../types/index.js';
import { ProductModel } from './product.js';
import { AppError } from '../middleware/errorHandler.js';

export class OrderModel {
    static async create(data: CreateOrderData): Promise<OrderWithItems> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            let totalCents = 0;
            const orderItems: Array<{
                product_id: number;
                qty: number;
                unit_price_cents: number;
                subtotal_cents: number;
            }> = [];

            for (const item of data.items) {
                const [productRows] = await connection.execute<RowDataPacket[]>(
                    'SELECT id, price_cents, stock FROM products WHERE id = ? FOR UPDATE',
                    [item.product_id]
                );

                if (productRows.length === 0) {
                    throw new AppError(404, `Product with ID ${item.product_id} not found`);
                }

                const product = productRows[0];

                if (product.stock < item.qty) {
                    throw new AppError(
                        400,
                        `Insufficient stock for product ID ${item.product_id}. Available: ${product.stock}, requested: ${item.qty}`
                    );
                }

                const subtotal = product.price_cents * item.qty;
                totalCents += subtotal;

                orderItems.push({
                    product_id: item.product_id,
                    qty: item.qty,
                    unit_price_cents: product.price_cents,
                    subtotal_cents: subtotal
                });

                await ProductModel.decreaseStock(item.product_id, item.qty, connection);
            }

            const [orderResult] = await connection.execute<ResultSetHeader>(
                'INSERT INTO orders (customer_id, status, total_cents) VALUES (?, ?, ?)',
                [data.customer_id, 'CREATED', totalCents]
            );

            const orderId = orderResult.insertId;

            for (const item of orderItems) {
                await connection.execute(
                    'INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES (?, ?, ?, ?, ?)',
                    [orderId, item.product_id, item.qty, item.unit_price_cents, item.subtotal_cents]
                );
            }

            await connection.commit();

            return await this.findByIdWithItems(orderId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findById(id: number): Promise<Order | null> {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM orders WHERE id = ?', [
            id
        ]);
        return rows.length > 0 ? (rows[0] as Order) : null;
    }

    static async findByIdWithItems(id: number): Promise<OrderWithItems> {
        const order = await this.findById(id);
        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        const [itemRows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM order_items WHERE order_id = ?',
            [id]
        );

        return {
            ...order,
            items: itemRows as OrderItem[]
        };
    }

    static async list(params: OrderListParams): Promise<Order[]> {
        const limit = Math.min(params.limit || 20, 100);
        let query = 'SELECT * FROM orders WHERE 1=1';
        const queryParams: any[] = [];

        if (params.status) {
            query += ' AND status = ?';
            queryParams.push(params.status);
        }

        if (params.from) {
            query += ' AND created_at >= ?';
            queryParams.push(params.from);
        }

        if (params.to) {
            query += ' AND created_at <= ?';
            queryParams.push(params.to);
        }

        if (params.cursor) {
            query += ' AND id > ?';
            queryParams.push(params.cursor);
        }

        query += ` ORDER BY id ASC LIMIT ${limit}`;

        const [rows] = await pool.execute<RowDataPacket[]>(query, queryParams);
        return rows as Order[];
    }

    static async confirm(id: number): Promise<OrderWithItems> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM orders WHERE id = ? FOR UPDATE',
                [id]
            );

            if (rows.length === 0) {
                throw new AppError(404, 'Order not found');
            }

            const order = rows[0] as Order;

            if (order.status === 'CONFIRMED') {
                await connection.commit();
                return await this.findByIdWithItems(id);
            }

            if (order.status === 'CANCELED') {
                throw new AppError(400, 'Cannot confirm a canceled order');
            }

            await connection.execute(
                'UPDATE orders SET status = ?, confirmed_at = NOW() WHERE id = ?',
                ['CONFIRMED', id]
            );

            await connection.commit();
            return await this.findByIdWithItems(id);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async cancel(id: number): Promise<OrderWithItems> {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM orders WHERE id = ? FOR UPDATE',
                [id]
            );

            if (rows.length === 0) {
                throw new AppError(404, 'Order not found');
            }

            const order = rows[0] as Order;

            if (order.status === 'CANCELED') {
                await connection.commit();
                return await this.findByIdWithItems(id);
            }

            if (order.status === 'CONFIRMED') {
                const confirmedAt = new Date(order.confirmed_at!);
                const now = new Date();
                const minutesSinceConfirmation =
                    (now.getTime() - confirmedAt.getTime()) / (1000 * 60);

                if (minutesSinceConfirmation > 10) {
                    throw new AppError(400, 'Cannot cancel confirmed order after 10 minutes');
                }
            }

            const [itemRows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM order_items WHERE order_id = ?',
                [id]
            );

            const items = itemRows as OrderItem[];

            for (const item of items) {
                await ProductModel.increaseStock(item.product_id, item.qty, connection);
            }

            await connection.execute(
                'UPDATE orders SET status = ?, canceled_at = NOW() WHERE id = ?',
                ['CANCELED', id]
            );

            await connection.commit();
            return await this.findByIdWithItems(id);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
