import { NextResponse } from "next/server";
import { createProtectedRoute } from "@/lib/utils/auth-middleware";
import { updateSupplierQualification } from "@/services/supplierService";
import { APIError } from "@/lib/utils/api-error";
import { validateSupplierData } from "@/lib/utils/validation/supplier";
import { supplierQualificationSchema } from "@/lib/utils/validation/supplier";

interface RouteParams {
  params: {
    id: string;
  };
}

async function handleUpdateQualification(
  request: Request,
  { params }: RouteParams
) {
  try {
    const json = await request.json();
    const validatedData = await validateSupplierData(json, supplierQualificationSchema);
    const qualification = await updateSupplierQualification(params.id, validatedData);
    
    return NextResponse.json(qualification);
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error updating supplier qualification" },
      { status: 500 }
    );
  }
}

export const PUT = createProtectedRoute(handleUpdateQualification, ["ADMIN"]); 