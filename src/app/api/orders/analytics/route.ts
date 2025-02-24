import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/auth-options";

type OrderStatus = "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";

interface OrderData {
  id: string;
  status: OrderStatus;
  createdAt: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "WORKER2"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get order statistics using Prisma's standard query
    const allOrders: OrderData[] = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate stats
    const stats = {
      total: allOrders.length,
      pending: allOrders.filter((o: OrderData) => o.status === "PENDING").length,
      approved: allOrders.filter((o: OrderData) => o.status === "APPROVED").length,
      completed: allOrders.filter((o: OrderData) => o.status === "COMPLETED").length,
      cancelled: allOrders.filter((o: OrderData) => o.status === "CANCELLED").length,
    };

    // Calculate trends for the last 7 days
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Convert date to YYYY-MM-DD format for comparison
      const dateStr = date.toISOString().split('T')[0];
      
      // Count orders for this date by comparing YYYY-MM-DD strings
      const ordersForDate = allOrders.filter((order: OrderData) => {
        const orderDate = new Date(order.createdAt);
        const orderDateStr = orderDate.toISOString().split('T')[0];
        return orderDateStr === dateStr;
      });

      trends.push({
        date: dateStr,
        count: ordersForDate.length,
      });

      // Debug logging for each date
      console.log(`Date ${dateStr}: Found ${ordersForDate.length} orders`);
      if (ordersForDate.length > 0) {
        console.log('Orders:', ordersForDate.map(o => ({ 
          id: o.id, 
          date: new Date(o.createdAt).toISOString(),
          status: o.status 
        })));
      }
    }

    const response = {
      stats,
      trends,
    };

    console.log('Final response:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching order analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
} 