import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  deleteItemCatalog,
  getItemCatalog,
  updateItemCatalog,
} from "@/services/itemCatalogService";
import {
  updateItemCatalogSchema,
  validateItemCatalogData,
} from "@/lib/utils/validation/item-catalog";
import { APIError } from "@/lib/utils/api-error";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itemCatalog = await getItemCatalog(params.id);
    return NextResponse.json(itemCatalog);
  } catch (error) {
    console.error("Error fetching item catalog:", error);
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error fetching item catalog" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = await validateItemCatalogData(
      updateItemCatalogSchema,
      json
    );

    const itemCatalog = await updateItemCatalog(params.id, validatedData);
    return NextResponse.json(itemCatalog);
  } catch (error) {
    console.error("Error updating item catalog:", error);
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error updating item catalog" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteItemCatalog(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting item catalog:", error);
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error deleting item catalog" },
      { status: 500 }
    );
  }
} 