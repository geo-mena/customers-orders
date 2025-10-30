import { Router } from 'express';
import { CustomerController } from '../controllers/customerController.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticateService } from '../middleware/auth.js';
import {
    createCustomerSchema,
    getCustomerSchema,
    listCustomersSchema,
    updateCustomerSchema,
    deleteCustomerSchema
} from '../utils/schemas.js';

const router = Router();

router.post('/', validateRequest(createCustomerSchema), CustomerController.create);

router.get('/', validateRequest(listCustomersSchema), CustomerController.list);

router.get('/:id', validateRequest(getCustomerSchema), CustomerController.getById);

router.put('/:id', validateRequest(updateCustomerSchema), CustomerController.update);

router.delete('/:id', validateRequest(deleteCustomerSchema), CustomerController.delete);

export default router;
