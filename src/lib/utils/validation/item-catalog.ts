import { z } from 'zod';
import { ItemStatus } from '@prisma/client';

export const itemCatalogSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.number().optional(),
  storageConditions: z.string().optional(),
  handlingInstructions: z.string().optional(),
  minimumStockLevel: z.number().min(0, 'Minimum stock level cannot be negative'),
  reorderPoint: z.number().min(0, 'Reorder point cannot be negative'),
  categoryId: z.string().optional(),
  status: z.nativeEnum(ItemStatus),
});

export const supplierItemSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  leadTime: z.number().min(0, 'Lead time cannot be negative').optional(),
  minimumOrderQty: z.number().min(1, 'Minimum order quantity must be at least 1'),
  packSize: z.number().min(1, 'Pack size must be at least 1'),
  isPreferred: z.boolean(),
  supplierSku: z.string().optional(),
});

export const createItemCatalogSchema = itemCatalogSchema.extend({
  suppliers: z.array(supplierItemSchema).min(1, 'At least one supplier is required'),
});

export const updateItemCatalogSchema = itemCatalogSchema.partial().extend({
  suppliers: z.array(supplierItemSchema).optional(),
});

export async function validateItemCatalogData<T>(schema: z.Schema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
} 