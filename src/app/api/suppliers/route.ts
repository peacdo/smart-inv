import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APIError } from "@/lib/utils/api-error";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        notes: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
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