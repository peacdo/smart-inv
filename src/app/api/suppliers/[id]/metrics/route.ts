import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total orders and calculate delivery rate
    const [totalOrders, totalDeliveredOrders] = await Promise.all([
      prisma.purchaseOrder.count({
        where: { supplierId: params.id },
      }),
      prisma.purchaseOrder.count({
        where: {
          supplierId: params.id,
          status: "RECEIVED",
        },
      }),
    ]);

    const onTimeDeliveryRate = totalDeliveredOrders > 0
      ? (totalDeliveredOrders / totalOrders) * 100
      : 0;

    // Get quality issues and returns
    const [qualityIssues, returns] = await Promise.all([
      prisma.goodsReceipt.count({
        where: {
          purchaseOrder: {
            supplierId: params.id,
          },
          status: "REJECTED",
        },
      }),
      prisma.goodsReceipt.count({
        where: {
          purchaseOrder: {
            supplierId: params.id,
          },
          status: "REJECTED",
        },
      }),
    ]);

    // Get email communications for response time calculation
    const communications = await prisma.$queryRaw`
      SELECT "createdAt"
      FROM "SupplierCommunication"
      WHERE "supplierId" = ${params.id}
      AND "type" = 'EMAIL'
      ORDER BY "createdAt" ASC
    `;

    // Calculate average response time
    let averageResponseTime = 0;
    if (Array.isArray(communications) && communications.length > 1) {
      let totalResponseTime = 0;
      let responseCount = 0;

      for (let i = 1; i < communications.length; i++) {
        const timeDiff = new Date(communications[i].createdAt).getTime() - 
                        new Date(communications[i - 1].createdAt).getTime();
        totalResponseTime += timeDiff;
        responseCount++;
      }

      averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount / (1000 * 60 * 60) : 0; // Convert to hours
    }

    // Get total spend
    const totalSpend = await prisma.purchaseOrder.aggregate({
      where: {
        supplierId: params.id,
        status: "RECEIVED",
      },
      _sum: {
        totalAmount: true,
      },
    });

    return NextResponse.json({
      totalOrders,
      onTimeDeliveryRate,
      qualityIssues,
      returns,
      averageResponseTime: Math.round(averageResponseTime * 10) / 10, // Round to 1 decimal place
      totalSpend: totalSpend._sum.totalAmount || 0,
    });
  } catch (error) {
    console.error("Error fetching supplier metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier metrics" },
      { status: 500 }
    );
  }
} 