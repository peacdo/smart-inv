import { NextResponse } from "next/server";
import { createProtectedRoute } from "@/lib/utils/auth-middleware";
import { getGoodsReceipt, updateGoodsReceiptStatus } from "@/services/goodsReceiptService";
import { APIError } from "@/lib/utils/api-error";
import { prisma } from "@/lib/prisma";
import { updateGoodsReceiptSchema, validateGoodsReceiptData } from "@/lib/utils/validation/goods-receipt";

async function handleGetGoodsReceipt(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const receipt = await getGoodsReceipt(context.params.id);
    return NextResponse.json(receipt);
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}

async function handleUpdateGoodsReceipt(
  request: Request,
  context: { params: { id: string } },
  session: any
) {
  try {
    const json = await request.json();
    const validatedData = await validateGoodsReceiptData(updateGoodsReceiptSchema, json);

    // If updating status, use the updateGoodsReceiptStatus function
    if (validatedData.status) {
      const updatedReceipt = await updateGoodsReceiptStatus(
        context.params.id,
        validatedData.status,
        session.user.id
      );
      return NextResponse.json(updatedReceipt);
    }

    // If only updating notes
    const receipt = await prisma.goodsReceipt.update({
      where: { id: context.params.id },
      data: { notes: validatedData.notes },
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

    return NextResponse.json(receipt);
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

async function handleDeleteGoodsReceipt(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const receipt = await prisma.goodsReceipt.findUnique({
      where: { id: context.params.id },
      select: { status: true },
    });

    if (!receipt) {
      throw new APIError("Goods receipt not found", 404, "RECEIPT_NOT_FOUND");
    }

    if (receipt.status === "COMPLETED") {
      throw new APIError(
        "Cannot delete a completed goods receipt",
        400,
        "INVALID_OPERATION"
      );
    }

    await prisma.goodsReceipt.delete({
      where: { id: context.params.id },
    });

    return NextResponse.json({ message: "Goods receipt deleted successfully" });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}

export const GET = createProtectedRoute(handleGetGoodsReceipt, ["ADMIN", "WORKER1"]);
export const PUT = createProtectedRoute(handleUpdateGoodsReceipt, ["ADMIN", "WORKER1"]);
export const DELETE = createProtectedRoute(handleDeleteGoodsReceipt, ["ADMIN"]); 