import { prisma } from "@/lib/prisma";
import { POStatus } from "@prisma/client";
import { APIError } from "@/lib/utils/api-error";
import { Prisma } from "@prisma/client";

export async function createPurchaseOrder(data: {
  supplierId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  userId: string;
}) {
  const { supplierId, items, notes, userId } = data;

  // Validate supplier exists
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });

  if (!supplier) {
    throw new APIError("Supplier not found", 404, "SUPPLIER_NOT_FOUND");
  }

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Create PO with items in a transaction
  const purchaseOrder = await prisma.$transaction(async (tx) => {
    // Create the PO
    const po = await tx.purchaseOrder.create({
      data: {
        supplierId,
        userId,
        totalAmount,
        notes,
        items: {
          create: items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return po;
  });

  return purchaseOrder;
}

export async function updatePurchaseOrderStatus(id: string, status: POStatus, userId: string) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!po) {
    throw new APIError("Purchase order not found", 404, "PO_NOT_FOUND");
  }

  // Validate status transition
  if (po.status === POStatus.CANCELLED || po.status === POStatus.RECEIVED) {
    throw new APIError(
      "Cannot update status of cancelled or received purchase orders",
      400,
      "INVALID_STATUS_TRANSITION"
    );
  }

  const updatedPO = await prisma.purchaseOrder.update({
    where: { id },
    data: { status },
    include: {
      supplier: true,
      items: {
        include: {
          item: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedPO;
}

export async function getPurchaseOrder(id: string) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: {
          item: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      receipts: {
        include: {
          items: true,
          receivedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!po) {
    throw new APIError("Purchase order not found", 404, "PO_NOT_FOUND");
  }

  return po;
}

export async function listPurchaseOrders(params?: {
  status?: POStatus;
  supplierId?: string;
  fromDate?: Date;
  toDate?: Date;
}) {
  const where = {
    ...(params?.status && { status: params.status }),
    ...(params?.supplierId && { supplierId: params.supplierId }),
    ...(params?.fromDate && params?.toDate && {
      createdAt: {
        gte: params.fromDate,
        lte: params.toDate,
      },
    }),
  };

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where,
    include: {
      supplier: true,
      items: {
        include: {
          item: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log("Fetched Purchase Orders:", purchaseOrders);

  return purchaseOrders;
}

const updatedReceipt = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
  // ... existing transaction code ...
}); 