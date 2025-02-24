import { prisma } from "@/lib/prisma";
import { APIError } from "@/lib/utils/api-error";
import { Prisma, PrismaClient } from "@prisma/client";
import { createStockHistory } from "./stockHistoryService";

type ReceiptStatus = "PENDING" | "COMPLETED" | "REJECTED";
type StockUpdateReason = "RESTOCK" | "SALE" | "RETURN" | "DAMAGE" | "ADJUSTMENT" | "EXPIRED";

export async function createGoodsReceipt(data: {
  purchaseOrderId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    batchNumber?: string;
    expiryDate?: Date;
  }>; 
  userId: string;
}) {
  const { purchaseOrderId, items, userId } = data;

  // Validate purchase order exists
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
  });

  if (!purchaseOrder) {
    throw new APIError("Purchase order not found", 404, "PO_NOT_FOUND");
  }

  // Create goods receipt
  const goodsReceipt = await prisma.goodsReceipt.create({
    data: {
      purchaseOrder: { connect: { id: purchaseOrderId } },
      receivedBy: { connect: { id: userId } },
      items: {
        create: items.map(item => ({
          item: { connect: { id: item.itemId } },
          quantity: item.quantity,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        })),
      },
    },
    include: {
      items: {
        include: {
          item: true,
        },
      },
      receivedBy: true,
      purchaseOrder: true,
    },
  });

  return goodsReceipt;
}

export async function getGoodsReceipt(id: string) {
  const receipt = await prisma.goodsReceipt.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          item: true,
        },
      },
      receivedBy: true,
      purchaseOrder: {
        include: {
          supplier: true,
        },
      },
    },
  });

  if (!receipt) {
    throw new APIError("Goods receipt not found", 404, "RECEIPT_NOT_FOUND");
  }

  return receipt;
}

export async function updateGoodsReceiptStatus(id: string, status: ReceiptStatus, userId: string) {
  const receipt = await prisma.goodsReceipt.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!receipt) {
    throw new APIError("Goods receipt not found", 404, "RECEIPT_NOT_FOUND");
  }

  if (receipt.status === "COMPLETED" || receipt.status === "REJECTED") {
    throw new APIError(
      "Cannot update status of completed or rejected receipts",
      400,
      "INVALID_STATUS_UPDATE"
    );
  }

  // If marking as completed, update stock levels
  if (status === "COMPLETED") {
    await prisma.$transaction(async (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">) => {
      // Update each item's stock level
      for (const receiptItem of receipt.items) {
        const currentStockLevel = receiptItem.item.stockLevel;
        const newStockLevel = currentStockLevel + receiptItem.quantity;

        // Update item stock level
        await tx.item.update({
          where: { id: receiptItem.item.id },
          data: {
            stockLevel: newStockLevel,
            lastPurchaseDate: new Date(),
            status: newStockLevel <= 0 ? "OUT_OF_STOCK" :
                    newStockLevel <= receiptItem.item.minimumStockLevel ? "LOW_STOCK" :
                    "AVAILABLE",
          },
        });

        // Create stock history record
        await createStockHistory(
          receiptItem.item.id,
          currentStockLevel,
          newStockLevel,
          "RESTOCK" as StockUpdateReason,
          userId,
          `Goods Receipt ${receipt.id}`
        );
      }

      // Update receipt status
      const updatedReceipt = await tx.goodsReceipt.update({
        where: { id },
        data: { status },
        include: {
          items: {
            include: {
              item: true,
            },
          },
          receivedBy: true,
          purchaseOrder: {
            include: {
              supplier: true,
            },
          },
        },
      });

      return updatedReceipt;
    });
  }

  // If not completing, just update the status
  const updatedReceipt = await prisma.goodsReceipt.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: {
          item: true,
        },
      },
      receivedBy: true,
      purchaseOrder: {
        include: {
          supplier: true,
        },
      },
    },
  });

  return updatedReceipt;
} 