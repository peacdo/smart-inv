import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';
import { generateQRCode, getQRCodes, deleteQRCode } from '@/services/qrCodeService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "WORKER2"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.request.findMany({
      include: {
        item: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    console.log("Received request data:", json); // Debug log

    const { type, itemId, quantity = 1, notes = "" } = json;

    // Validate required fields
    if (!type || !itemId) {
      return NextResponse.json(
        { error: "Type and itemId are required" },
        { status: 400 }
      );
    }

    // Create the request with default status
    const newRequest = await prisma.request.create({
      data: {
        type,
        status: "PENDING", // Set default status
        item: { connect: { id: itemId } },
        user: { connect: { id: session.user.id } },
        quantity,
        notes,
      },
      include: {
        item: true,
        user: true,
      },
    });

    console.log("Created request:", newRequest); // Debug log
    return NextResponse.json(newRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
} 