import { z } from 'zod';

export const goodsReceiptItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  batchNumber: z.string().optional(),
  expiryDate: z.union([
    z.string().transform((val) => new Date(val)),
    z.date(),
  ]).optional(),
});

export const createGoodsReceiptSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase order ID is required'),
  items: z.array(goodsReceiptItemSchema).min(1, 'At least one item is required'),
});

export const updateGoodsReceiptSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'REJECTED']).optional(),
  notes: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export async function validateGoodsReceiptData<T>(schema: z.Schema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
} 