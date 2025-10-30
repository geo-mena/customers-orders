import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database.js';
import { Product, CreateProductData, UpdateProductData, PaginationParams } from '../types/index.js';

export class ProductModel {
    static async create(data: CreateProductData): Promise<Product> {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO products (sku, name, price_cents, stock) VALUES (?, ?, ?, ?)',
            [data.sku, data.name, data.price_cents, data.stock]
        );

        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [
            result.insertId
        ]);

        return rows[0] as Product;
    }

    static async findById(id: number): Promise<Product | null> {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [
            id
        ]);
        return rows.length > 0 ? (rows[0] as Product) : null;
    }

    static async findBySku(sku: string): Promise<Product | null> {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM products WHERE sku = ?', [
            sku
        ]);
        return rows.length > 0 ? (rows[0] as Product) : null;
    }

    static async list(params: PaginationParams): Promise<Product[]> {
        const limit = Math.min(params.limit || 20, 100);
        let query = 'SELECT * FROM products WHERE 1=1';
        const queryParams: any[] = [];

        if (params.search) {
            query += ' AND (name LIKE ? OR sku LIKE ?)';
            const searchPattern = `%${params.search}%`;
            queryParams.push(searchPattern, searchPattern);
        }

        if (params.cursor) {
            query += ' AND id > ?';
            queryParams.push(params.cursor);
        }

        query += ` ORDER BY id ASC LIMIT ${limit}`;

        const [rows] = await pool.execute<RowDataPacket[]>(query, queryParams);
        return rows as Product[];
    }

    static async update(id: number, data: UpdateProductData): Promise<Product | null> {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.price_cents !== undefined) {
            updates.push('price_cents = ?');
            values.push(data.price_cents);
        }

        if (data.stock !== undefined) {
            updates.push('stock = ?');
            values.push(data.stock);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        values.push(id);

        await pool.execute(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

        return this.findById(id);
    }

    static async decreaseStock(productId: number, qty: number, connection: any): Promise<void> {
        await connection.execute(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
            [qty, productId, qty]
        );
    }

    static async increaseStock(productId: number, qty: number, connection: any): Promise<void> {
        await connection.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [
            qty,
            productId
        ]);
    }
}
