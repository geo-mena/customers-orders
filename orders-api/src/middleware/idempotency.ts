import { Request, Response, NextFunction } from 'express';

export interface IdempotentRequest extends Request {
    idempotencyKey?: string;
}

export function requireIdempotencyKey(
    req: IdempotentRequest,
    res: Response,
    next: NextFunction
): void {
    const idempotencyKey = req.headers['x-idempotency-key'] as string;

    if (!idempotencyKey) {
        res.status(400).json({
            success: false,
            error: 'X-Idempotency-Key header is required'
        });
        return;
    }

    req.idempotencyKey = idempotencyKey;
    next();
}
