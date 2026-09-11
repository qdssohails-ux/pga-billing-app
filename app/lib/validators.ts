import { z } from 'zod';

export const checkoutSchema = z.object({
  discount: z.number().min(0),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI']),
  items: z.array(z.object({
    productId: z.string().min(1),
    qty: z.number().int().positive(),
  })).min(1),
});

export const stockUpdateSchema = z.object({
  productId: z.string().min(1),
  stockQty: z.number().int().min(0),
});
