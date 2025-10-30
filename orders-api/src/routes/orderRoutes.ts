import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { validateRequest } from '../middleware/validate.js';
import { requireIdempotencyKey } from '../middleware/idempotency.js';
import {
    createOrderSchema,
    getOrderSchema,
    listOrdersSchema,
    confirmOrderSchema,
    cancelOrderSchema
} from '../utils/schemas.js';

const router = Router();

router.post('/', validateRequest(createOrderSchema), OrderController.create);

router.get('/', validateRequest(listOrdersSchema), OrderController.list);

router.get('/:id', validateRequest(getOrderSchema), OrderController.getById);

router.post(
    '/:id/confirm',
    requireIdempotencyKey,
    validateRequest(confirmOrderSchema),
    OrderController.confirm
);

router.post('/:id/cancel', validateRequest(cancelOrderSchema), OrderController.cancel);

export default router;
