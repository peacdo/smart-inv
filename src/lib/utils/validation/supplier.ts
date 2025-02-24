import { z } from 'zod';

const supplierContactSchema = z.object({
  name: z.string().min(2, 'Contact name must be at least 2 characters'),
  title: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const createSupplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  taxId: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  paymentTerms: z.string().optional(),
  currency: z.string().optional(),
  diversityStatus: z.string().optional(),
  categories: z.array(z.string()).optional(),
  contacts: z.array(supplierContactSchema).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'BLACKLISTED']).optional(),
  rating: z.number().min(0).max(5).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export const supplierDocumentSchema = z.object({
  type: z.enum(['CONTRACT', 'CERTIFICATION', 'INSURANCE', 'LICENSE', 'FINANCIAL', 'COMPLIANCE', 'OTHER']),
  name: z.string().min(2, 'Document name must be at least 2 characters'),
  url: z.string().url('Invalid document URL'),
  expiryDate: z.string().datetime().optional(),
});

export const supplierCommunicationSchema = z.object({
  type: z.enum(['EMAIL', 'MEETING', 'PHONE', 'AUDIT', 'OTHER']),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  content: z.string().min(1, 'Content is required'),
  attachments: z.array(z.string().url('Invalid attachment URL')).optional(),
  sender: z.string().email('Invalid sender email'),
  recipient: z.string().email('Invalid recipient email'),
});

export const supplierQualificationSchema = z.object({
  type: z.string().min(2, 'Qualification type must be at least 2 characters'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED']),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().optional(),
  attachments: z.array(z.string().url('Invalid attachment URL')).optional(),
  notes: z.string().optional(),
});

export async function validateSupplierData<T>(data: unknown, schema: z.ZodSchema<T>): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
} 