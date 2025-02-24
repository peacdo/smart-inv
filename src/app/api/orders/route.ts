import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProtectedRoute } from "@/lib/utils/auth-middleware";
import { orderSchema } from "@/lib/utils/validation";
import { createStockHistory } from "@/services/itemService";
import { APIError } from "@/lib/utils/api-error";
import { StockUpdateReason } from "@prisma/client";

async function handleGetOrders(request: Request) {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(orders);
}

async function handleCreateOrder(request: Request, context: any, session: any) {
  const json = await request.json();
  const validatedData = await orderSchema.parseAsync(json);

  // Validate items and check stock levels
  const itemIds = validatedData.items.map(item => item.id);
  const existingItems = await prisma.item.findMany({
    where: { id: { in: itemIds } },
  });

  if (existingItems.length !== itemIds.length) {
    throw new APIError('One or more items not found', 400, 'ITEMS_NOT_FOUND');
  }

  // Check stock levels
  const invalidItems = existingItems.filter(item => {
    const requestedQuantity = validatedData.items.find(i => i.id === item.id)?.quantity || 0;
    return requestedQuantity > item.stockLevel;
  });

  if (invalidItems.length > 0) {
    throw new APIError(
      `Insufficient stock for items: ${invalidItems.map(item => item.name).join(", ")}`,
      400,
      'INSUFFICIENT_STOCK'
    );
  }

  // Create order and update stock levels in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        userId: validatedData.userId,
        items: {
          connect: itemIds.map(id => ({ id })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            stockLevel: true,
          },
        },
      },
    });

    // Update stock levels and create stock history
    for (const item of validatedData.items) {
      const existingItem = existingItems.find(i => i.id === item.id);
      if (!existingItem) continue;

      const newStockLevel = existingItem.stockLevel - item.quantity;
      
      await tx.item.update({
        where: { id: item.id },
        data: {
          stockLevel: newStockLevel,
          status: newStockLevel <= 0 ? "OUT_OF_STOCK" : 
                  newStockLevel <= existingItem.minimumStockLevel ? "LOW_STOCK" : 
                  "AVAILABLE",
        },
      });

      await createStockHistory(
        item.id,
        existingItem.stockLevel,
        newStockLevel,
        StockUpdateReason.SALE,
        session.user.id,
        `Order ${newOrder.id}`
      );
    }

    return newOrder;
  });

  return NextResponse.json(order);
}

const rateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
};

export const GET = createProtectedRoute(
  handleGetOrders,
  ['ADMIN', 'WORKER2'],
  { rateLimit: rateLimitConfig }
);

export const POST = createProtectedRoute(
  handleCreateOrder,
  ['ADMIN', 'WORKER2'],
  { rateLimit: { ...rateLimitConfig, max: 10 } } // Stricter limit for POST
); 