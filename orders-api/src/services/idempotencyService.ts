import { RowDataPacket } from 'mysql2';
import { pool } from '../config/database.js';
import { IdempotencyKey } from '../types/index.js';
import { config } from '../config/env.js';

export class IdempotencyService {
    static async check(key: string, targetType: string): Promise<IdempotencyKey | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM idempotency_keys WHERE `key` = ? AND target_type = ? AND expires_at > NOW()',
            [key, targetType]
        );

        return rows.length > 0 ? (rows[0] as IdempotencyKey) : null;
    }

    static async create(
        key: string,
        targetType: string,
        targetId: number | null,
        status: string,
        responseBody: string
    ): Promise<void> {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + config.idempotency.expirationHours);

        await pool.execute(
            'INSERT INTO idempotency_keys (`key`, target_type, target_id, status, response_body, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
            [key, targetType, targetId, status, responseBody, expiresAt]
        );
    }

    static async update(key: string, status: string, responseBody: string): Promise<void> {
        await pool.execute(
            'UPDATE idempotency_keys SET status = ?, response_body = ? WHERE `key` = ?',
            [status, responseBody, key]
        );
    }
}
