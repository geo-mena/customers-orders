import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/order.js';
import { customersApiClient } from '../services/customersApiClient.js';
import { IdempotencyService } from '../services/idempotencyService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateOrderData, OrderListParams } from '../types/index.js';
import { IdempotentRequest } from '../middleware/idempotency.js';

export class OrderController {
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: CreateOrderData = req.body;

            await customersApiClient.getCustomer(data.customer_id);

            const order = await OrderModel.create(data);

            res.status(201).json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);

            const order = await OrderModel.findByIdWithItems(id);

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status, from, to, cursor, limit } = req.query;

            const params: OrderListParams = {
                status: status as any,
                from: from as string,
                to: to as string,
                cursor: cursor ? parseInt(cursor as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined
            };

            const orders = await OrderModel.list(params);

            res.json({
                success: true,
                data: orders,
                meta: {
                    nextCursor: orders.length > 0 ? orders[orders.length - 1].id : null
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async confirm(req: IdempotentRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            const idempotencyKey = req.idempotencyKey!;

            const existing = await IdempotencyService.check(idempotencyKey, 'order_confirm');

            if (existing && existing.response_body) {
                const cachedResponse = JSON.parse(existing.response_body);
                res.status(200).json(cachedResponse);
                return;
            }

            const order = await OrderModel.confirm(id);

            const response = {
                success: true,
                data: order
            };

            await IdempotencyService.create(
                idempotencyKey,
                'order_confirm',
                order.id,
                'completed',
                JSON.stringify(response)
            );

            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);

            const order = await OrderModel.cancel(id);

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }
}
