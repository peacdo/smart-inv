import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createItemCatalog,
  getItemCatalogs,
} from "@/services/itemCatalogService";
import {
  createItemCatalogSchema,
  validateItemCatalogData,
} from "@/lib/utils/validation/item-catalog";
import { APIError } from "@/lib/utils/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await getItemCatalogs({
      search,
      categoryId,
      status,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching item catalogs:", error);
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error fetching item catalogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = await validateItemCatalogData(
      createItemCatalogSchema,
      json
    );

    const itemCatalog = await createItemCatalog({
      ...validatedData,
      userId: session.user.id,
    });

    return NextResponse.json(itemCatalog);
  } catch (error) {
    console.error("Error creating item catalog:", error);
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Error creating item catalog" },
      { status: 500 }
    );
  }
} 