import { NextResponse } from "next/server";
import { createProtectedRoute } from "@/lib/utils/auth-middleware";
import { createGoodsReceipt } from "@/services/goodsReceiptService";
import { APIError } from "@/lib/utils/api-error";
import { prisma } from "@/lib/prisma";
import { createGoodsReceiptSchema, validateGoodsReceiptData } from "@/lib/utils/validation/goods-receipt";

async function handleCreateGoodsReceipt(request: Request, context: any, session: any) {
  try {
    const json = await request.json();
    const validatedData = await validateGoodsReceiptData(createGoodsReceiptSchema, json);
    
    const goodsReceipt = await createGoodsReceipt({
      ...validatedData,
      userId: session.user.id,
    });
    
    return NextResponse.json(goodsReceipt, { status: 201 });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    throw error;
  }
}

async function handleGetGoodsReceipts(request: Request) {
  const receipts = await prisma.goodsReceipt.findMany({
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
    orderBy: {
      receivedDate: 'desc',
    },
  });

  return NextResponse.json(receipts);
}

export const POST = createProtectedRoute(handleCreateGoodsReceipt, ["ADMIN", "WORKER1"]);
export const GET = createProtectedRoute(handleGetGoodsReceipts, ["ADMIN", "WORKER1"]); 