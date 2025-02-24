import { prisma } from "@/lib/prisma";
import { ItemCatalog, Prisma } from "@prisma/client";
import { APIError } from "@/lib/utils/api-error";

const itemCatalogInclude = {
  category: true,
  suppliers: {
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  },
  createdBy: {
    select: {
      name: true,
      email: true,
    },
  },
} as const;

export async function getItemCatalogs(params: {
  search?: string;
  categoryId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { search, categoryId, status, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ItemCatalogWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(status && { status }),
  };

  const [items, total] = await Promise.all([
    prisma.itemCatalog.findMany({
      where,
      include: itemCatalogInclude,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.itemCatalog.count({ where }),
  ]);

  return {
    items,
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function getItemCatalog(id: string) {
  const itemCatalog = await prisma.itemCatalog.findUnique({
    where: { id },
    include: itemCatalogInclude,
  });

  if (!itemCatalog) {
    throw new APIError("Item catalog not found", 404, "ITEM_CATALOG_NOT_FOUND");
  }

  return itemCatalog;
}

export async function createItemCatalog(data: {
  name: string;
  description?: string;
  dimensions?: string;
  weight?: number;
  storageConditions?: string;
  handlingInstructions?: string;
  minimumStockLevel: number;
  reorderPoint: number;
  categoryId?: string;
  status: string;
  suppliers: Array<{
    supplierId: string;
    unitPrice: number;
    leadTime?: number;
    minimumOrderQty: number;
    packSize: number;
    isPreferred: boolean;
    supplierSku?: string;
  }>;
  userId: string;
}) {
  const { suppliers, ...itemCatalogData } = data;

  return await prisma.itemCatalog.create({
    data: {
      ...itemCatalogData,
      suppliers: {
        create: suppliers,
      },
    },
    include: itemCatalogInclude,
  });
}

export async function updateItemCatalog(
  id: string,
  data: Partial<{
    name: string;
    description?: string;
    dimensions?: string;
    weight?: number;
    storageConditions?: string;
    handlingInstructions?: string;
    minimumStockLevel: number;
    reorderPoint: number;
    categoryId?: string;
    status: string;
    suppliers?: Array<{
      id?: string;
      supplierId: string;
      unitPrice: number;
      leadTime?: number;
      minimumOrderQty: number;
      packSize: number;
      isPreferred: boolean;
      supplierSku?: string;
    }>;
  }>
) {
  const { suppliers, ...itemCatalogData } = data;

  // Start a transaction to handle both item catalog and supplier updates
  return await prisma.$transaction(async (tx) => {
    // Update item catalog
    const updatedCatalog = await tx.itemCatalog.update({
      where: { id },
      data: itemCatalogData,
      include: itemCatalogInclude,
    });

    // If suppliers are provided, update them
    if (suppliers) {
      // Delete existing supplier relationships not in the update
      const supplierIds = suppliers.map((s) => s.supplierId);
      await tx.supplierItem.deleteMany({
        where: {
          itemCatalogId: id,
          NOT: {
            supplierId: {
              in: supplierIds,
            },
          },
        },
      });

      // Update or create supplier relationships
      for (const supplier of suppliers) {
        const { id: supplierId, ...supplierData } = supplier;
        await tx.supplierItem.upsert({
          where: {
            supplierId_itemCatalogId: {
              supplierId: supplier.supplierId,
              itemCatalogId: id,
            },
          },
          create: {
            ...supplierData,
            itemCatalogId: id,
          },
          update: supplierData,
        });
      }
    }

    return updatedCatalog;
  });
}

export async function deleteItemCatalog(id: string) {
  // Check if there are any items using this catalog
  const itemCount = await prisma.item.count({
    where: { itemCatalogId: id },
  });

  if (itemCount > 0) {
    throw new APIError(
      "Cannot delete item catalog that is in use",
      400,
      "ITEM_CATALOG_IN_USE"
    );
  }

  await prisma.itemCatalog.delete({
    where: { id },
  });
}

export async function getItemCatalogSuppliers(id: string) {
  const suppliers = await prisma.supplierItem.findMany({
    where: { itemCatalogId: id },
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: [
      { isPreferred: "desc" },
      { unitPrice: "asc" },
    ],
  });

  return suppliers;
} 