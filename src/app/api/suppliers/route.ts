import { NextResponse } from "next/server";
import { createProtectedRoute } from "@/lib/utils/auth-middleware";
import { getSuppliers, createSupplier } from "@/services/supplierService";
import { APIError } from "@/lib/utils/api-error";
import { validateSupplierData } from "@/lib/utils/validation/supplier";

async function handleGetSuppliers(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const riskLevel = searchParams.get("riskLevel") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await getSuppliers({
      search,
      status,
      categoryId,
      riskLevel,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error fetching suppliers" },
      { status: 500 }
    );
  }
}

async function handleCreateSupplier(request: Request) {
  try {
    const json = await request.json();
    const validatedData = await validateSupplierData(json);
    const supplier = await createSupplier(validatedData);
    
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error creating supplier" },
      { status: 500 }
    );
  }
}

export const GET = createProtectedRoute(handleGetSuppliers, ["ADMIN", "WORKER1"]);
export const POST = createProtectedRoute(handleCreateSupplier, ["ADMIN"]); 