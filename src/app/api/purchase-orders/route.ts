import { NextResponse } from "next/server";
import { createProtectedRoute } from "@/lib/utils/auth-middleware";
import { createPurchaseOrder, listPurchaseOrders } from "@/services/purchaseOrderService";
import { APIError } from "@/lib/utils/api-error";

async function handleCreatePO(request: Request, context: any, session: any) {
  const json = await request.json();
  
  try {
    const purchaseOrder = await createPurchaseOrder({
      ...json,
      userId: session.user.id,
    });
    
    return NextResponse.json(purchaseOrder, { status: 201 });
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

async function handleGetPOs(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const supplierId = searchParams.get("supplierId");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  const params = {
    ...(status && { status }),
    ...(supplierId && { supplierId }),
    ...(fromDate && toDate && {
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    }),
  };

  const purchaseOrders = await listPurchaseOrders(params);
  return NextResponse.json(purchaseOrders);
}

export const POST = createProtectedRoute(handleCreatePO, ["ADMIN", "WORKER1"]);
export const GET = createProtectedRoute(handleGetPOs, ["ADMIN", "WORKER1"]); 