import { NextResponse } from "next/server";
import { createProtectedRoute } from "@/lib/utils/auth-middleware";
import { addSupplierDocument } from "@/services/supplierService";
import { APIError } from "@/lib/utils/api-error";
import { validateSupplierData } from "@/lib/utils/validation/supplier";
import { supplierDocumentSchema } from "@/lib/utils/validation/supplier";

interface RouteParams {
  params: {
    id: string;
  };
}

async function handleAddDocument(
  request: Request,
  { params }: RouteParams
) {
  try {
    const json = await request.json();
    const validatedData = await validateSupplierData(json, supplierDocumentSchema);
    const document = await addSupplierDocument(params.id, validatedData);
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error adding supplier document" },
      { status: 500 }
    );
  }
}

export const POST = createProtectedRoute(handleAddDocument, ["ADMIN"]); 