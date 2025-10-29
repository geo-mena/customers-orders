import { Router } from 'express';
import { CustomerController } from '../controllers/customerController.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticateService } from '../middleware/auth.js';
import { getCustomerSchema } from '../utils/schemas.js';

const router = Router();

router.get(
  '/customers/:id',
  authenticateService,
  validateRequest(getCustomerSchema),
  CustomerController.getById
);

export default router;
