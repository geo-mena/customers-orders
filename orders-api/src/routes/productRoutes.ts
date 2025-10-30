import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';
import { validateRequest } from '../middleware/validate.js';
import {
    createProductSchema,
    updateProductSchema,
    getProductSchema,
    listProductsSchema
} from '../utils/schemas.js';

const router = Router();

router.post('/', validateRequest(createProductSchema), ProductController.create);

router.get('/', validateRequest(listProductsSchema), ProductController.list);

router.get('/:id', validateRequest(getProductSchema), ProductController.getById);

router.patch('/:id', validateRequest(updateProductSchema), ProductController.update);

export default router;
