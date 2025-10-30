import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database.js';
import {
    Customer,
    CreateCustomerData,
    UpdateCustomerData,
    PaginationParams
} from '../types/index.js';

export class CustomerModel {
    static async create(data: CreateCustomerData): Promise<Customer> {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
            [data.name, data.email, data.phone || null]
        );

        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM customers WHERE id = ?', [
            result.insertId
        ]);

        return rows[0] as Customer;
    }

    static async findById(id: number, includeDeleted = false): Promise<Customer | null> {
        const query = includeDeleted
            ? 'SELECT * FROM customers WHERE id = ?'
            : 'SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL';

        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? (rows[0] as Customer) : null;
    }

    static async findByEmail(email: string): Promise<Customer | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM customers WHERE email = ? AND deleted_at IS NULL',
            [email]
        );
        return rows.length > 0 ? (rows[0] as Customer) : null;
    }

    static async list(params: PaginationParams): Promise<Customer[]> {
        const limit = Math.min(params.limit || 20, 100);
        let query = 'SELECT * FROM customers WHERE deleted_at IS NULL';
        const queryParams: any[] = [];

        if (params.search) {
            query += ' AND (name LIKE ? OR email LIKE ?)';
            const searchPattern = `%${params.search}%`;
            queryParams.push(searchPattern, searchPattern);
        }

        if (params.cursor) {
            query += ' AND id > ?';
            queryParams.push(params.cursor);
        }

        query += ` ORDER BY id ASC LIMIT ${limit}`;

        const [rows] = await pool.execute<RowDataPacket[]>(query, queryParams);
        return rows as Customer[];
    }

    static async update(id: number, data: UpdateCustomerData): Promise<Customer | null> {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }

        if (data.email !== undefined) {
            updates.push('email = ?');
            values.push(data.email);
        }

        if (data.phone !== undefined) {
            updates.push('phone = ?');
            values.push(data.phone);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        values.push(id);

        await pool.execute(
            `UPDATE customers SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
            values
        );

        return this.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE customers SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
            [id]
        );

        return result.affectedRows > 0;
    }
}
