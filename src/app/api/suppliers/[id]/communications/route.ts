import { NextResponse } from "next/server";
import { createProtectedRoute } from "@/lib/utils/auth-middleware";
import { addSupplierCommunication } from "@/services/supplierService";
import { APIError } from "@/lib/utils/api-error";
import { validateSupplierData } from "@/lib/utils/validation/supplier";
import { supplierCommunicationSchema } from "@/lib/utils/validation/supplier";

interface RouteParams {
  params: {
    id: string;
  };
}

async function handleAddCommunication(
  request: Request,
  { params }: RouteParams
) {
  try {
    const json = await request.json();
    const validatedData = await validateSupplierData(json, supplierCommunicationSchema);
    const communication = await addSupplierCommunication(params.id, validatedData);
    
    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error adding supplier communication" },
      { status: 500 }
    );
  }
}

export const POST = createProtectedRoute(handleAddCommunication, ["ADMIN", "WORKER1"]); 