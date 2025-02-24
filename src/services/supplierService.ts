import { prisma } from "@/lib/prisma";
import { APIError } from "@/lib/utils/api-error";
import { Prisma, SupplierStatus, DocumentType, CommunicationType } from "@prisma/client";

const supplierInclude = {
  contacts: true,
  documents: true,
  categories: true,
  qualifications: true,
  communications: {
    orderBy: {
      createdAt: 'desc'
    }
  },
  items: {
    include: {
      itemCatalog: true
    }
  }
} as const;

export async function getSuppliers(params: {
  search?: string;
  status?: SupplierStatus;
  categoryId?: string;
  riskLevel?: string;
  page?: number;
  limit?: number;
}) {
  const { search, status, categoryId, riskLevel, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.SupplierWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
    ...(categoryId && {
      categories: {
        some: { id: categoryId }
      }
    }),
    ...(riskLevel && { riskLevel }),
  };

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: supplierInclude,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.count({ where }),
  ]);

  return {
    suppliers,
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function getSupplier(id: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: supplierInclude,
  });

  if (!supplier) {
    throw new APIError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
  }

  return supplier;
}

export async function createSupplier(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  taxId?: string;
  website?: string;
  paymentTerms?: string;
  currency?: string;
  diversityStatus?: string;
  categories?: string[];
  contacts?: Array<{
    name: string;
    title?: string;
    email: string;
    phone?: string;
    department?: string;
    isPrimary?: boolean;
  }>;
}) {
  const { categories, contacts, ...supplierData } = data;

  return await prisma.supplier.create({
    data: {
      ...supplierData,
      categories: categories ? {
        connect: categories.map(id => ({ id }))
      } : undefined,
      contacts: contacts ? {
        create: contacts
      } : undefined,
    },
    include: supplierInclude,
  });
}

export async function updateSupplier(id: string, data: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: SupplierStatus;
  rating?: number;
  taxId?: string;
  website?: string;
  paymentTerms?: string;
  currency?: string;
  diversityStatus?: string;
  riskLevel?: string;
  categories?: string[];
}) {
  const { categories, ...supplierData } = data;

  return await prisma.supplier.update({
    where: { id },
    data: {
      ...supplierData,
      categories: categories ? {
        set: categories.map(id => ({ id }))
      } : undefined,
    },
    include: supplierInclude,
  });
}

export async function addSupplierDocument(supplierId: string, data: {
  type: DocumentType;
  name: string;
  url: string;
  expiryDate?: string;
}) {
  const { expiryDate, ...documentData } = data;

  return await prisma.supplierDocument.create({
    data: {
      ...documentData,
      supplierId,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    },
  });
}

export async function addSupplierCommunication(supplierId: string, data: {
  type: CommunicationType;
  subject: string;
  content: string;
  attachments?: string[];
  sender: string;
  recipient: string;
}) {
  return await prisma.supplierCommunication.create({
    data: {
      ...data,
      supplierId,
    },
  });
}

export async function updateSupplierQualification(supplierId: string, data: {
  type: string;
  status: string;
  validFrom: string;
  validUntil?: string;
  attachments?: string[];
  notes?: string;
}) {
  const { validFrom, validUntil, ...qualificationData } = data;

  return await prisma.supplierQualification.upsert({
    where: {
      supplierId_type: {
        supplierId,
        type: data.type,
      },
    },
    update: {
      ...qualificationData,
      validFrom: new Date(validFrom),
      validUntil: validUntil ? new Date(validUntil) : undefined,
    },
    create: {
      ...qualificationData,
      supplierId,
      validFrom: new Date(validFrom),
      validUntil: validUntil ? new Date(validUntil) : undefined,
    },
  });
}

export async function getSupplierPerformanceMetrics(supplierId: string) {
  const [
    totalOrders,
    onTimeDeliveries,
    qualityIssues,
    averageResponseTime,
    returns,
  ] = await Promise.all([
    prisma.purchaseOrder.count({
      where: { supplierId },
    }),
    prisma.purchaseOrder.count({
      where: {
        supplierId,
        deliveredOnTime: true,
      },
    }),
    prisma.qualityIncident.count({
      where: {
        supplierId,
      },
    }),
    prisma.supplierCommunication.aggregate({
      where: {
        supplierId,
        type: 'EMAIL',
      },
      _avg: {
        responseTime: true,
      },
    }),
    prisma.return.count({
      where: {
        supplierId,
      },
    }),
  ]);

  return {
    totalOrders,
    onTimeDeliveryRate: totalOrders ? (onTimeDeliveries / totalOrders) * 100 : 0,
    qualityIssues,
    averageResponseTime: averageResponseTime._avg.responseTime || 0,
    returns,
  };
} 