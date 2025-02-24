import { NextResponse } from "next/server";
import { createProtectedRoute } from "@/lib/utils/auth-middleware";
import { getPurchaseOrder, updatePurchaseOrderStatus } from "@/services/purchaseOrderService";
import { APIError } from "@/lib/utils/api-error";

async function handleGetPO(request: Request, context: { params: { id: string } }) {
  try {
    const purchaseOrder = await getPurchaseOrder(context.params.id);
    return NextResponse.json(purchaseOrder);
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

async function handleUpdatePO(
  request: Request,
  context: { params: { id: string } },
  session: any
) {
  const json = await request.json();
  const { status } = json;

  try {
    const purchaseOrder = await updatePurchaseOrderStatus(
      context.params.id,
      status,
      session.user.id
    );
    return NextResponse.json(purchaseOrder);
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

export const GET = createProtectedRoute(handleGetPO, ["ADMIN", "WORKER1"]);
export const PUT = createProtectedRoute(handleUpdatePO, ["ADMIN", "WORKER1"]); 