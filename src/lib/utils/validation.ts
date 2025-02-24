import { z } from 'zod';
import { APIError } from './api-error';

export const UserRole = z.enum(['ADMIN', 'WORKER1', 'WORKER2', 'USER']);
export const ItemStatus = z.enum(['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED', 'DAMAGED']);
export const OrderStatus = z.enum(['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED']);

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: UserRole,
});

export const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.number().nullable(),
  storageConditions: z.string().optional(),
  handlingInstructions: z.string().optional(),
  stockLevel: z.number().min(0, 'Stock level cannot be negative'),
  warehouse: z.string().optional(),
  aisle: z.string().optional(),
  shelf: z.string().optional(),
  expiryDate: z.string().optional(),
  status: ItemStatus,
  supplierId: z.string().min(1, 'Supplier is required'),
  categoryId: z.string().optional(),
  itemCatalogId: z.string().optional(),
});

export const orderSchema = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'Order must contain at least one item'),
});

export async function validateData<T>(schema: z.Schema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(error.errors[0].message, 400, 'VALIDATION_ERROR');
    }
    throw error;
  }
} 