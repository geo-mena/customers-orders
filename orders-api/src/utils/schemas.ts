import { z } from 'zod';

export const createProductSchema = z.object({
    body: z.object({
        sku: z.string().min(1).max(100),
        name: z.string().min(1).max(255),
        price_cents: z.number().int().min(0),
        stock: z.number().int().min(0)
    })
});

export const updateProductSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/)
    }),
    body: z.object({
        price_cents: z.number().int().min(0).optional(),
        stock: z.number().int().min(0).optional()
    })
});

export const getProductSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/)
    })
});

export const listProductsSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        cursor: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional()
    })
});

export const createOrderSchema = z.object({
    body: z.object({
        customer_id: z.number().int().positive(),
        items: z
            .array(
                z.object({
                    product_id: z.number().int().positive(),
                    qty: z.number().int().positive()
                })
            )
            .min(1)
    })
});

export const getOrderSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/)
    })
});

export const listOrdersSchema = z.object({
    query: z.object({
        status: z.enum(['CREATED', 'CONFIRMED', 'CANCELED']).optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        cursor: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional()
    })
});

export const confirmOrderSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/)
    })
});

export const cancelOrderSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/)
    })
});
