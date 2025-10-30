import mysql from 'mysql2/promise';
import { config } from './env.js';

export const pool = mysql.createPool(config.db);

export async function testConnection(): Promise<void> {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}
