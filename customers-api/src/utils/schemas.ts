import { z } from 'zod';

export const createCustomerSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(255),
        phone: z.string().max(50).optional()
    })
});

export const updateCustomerSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/)
    }),
    body: z.object({
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().max(255).optional(),
        phone: z.string().max(50).optional()
    })
});

export const getCustomerSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/)
    })
});

export const listCustomersSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        cursor: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional()
    })
});

export const deleteCustomerSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/)
    })
});
