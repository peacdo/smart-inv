import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/auth-options";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "WORKER2"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "WORKER2"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const json = await request.json();
  const { status } = json;

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json(order);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "WORKER2"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await prisma.order.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Order deleted successfully" });
} 