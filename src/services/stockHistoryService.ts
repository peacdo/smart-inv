import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { StockUpdateReason } from "@prisma/client"

export async function getStockHistory(itemId: string) {
  try {
    const history = await prisma.stockHistory.findMany({
      where: { itemId },
      include: {
        updatedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching stock history:", error)
    return NextResponse.json(
      { error: "Error fetching stock history" },
      { status: 500 }
    )
  }
}

export async function createStockHistory(
  itemId: string,
  oldLevel: number,
  newLevel: number,
  reason: StockUpdateReason,
  userId: string,
  notes?: string
) {
  try {
    const history = await prisma.stockHistory.create({
      data: {
        itemId,
        oldLevel,
        newLevel,
        reason,
        userId,
        notes,
      },
      include: {
        updatedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return history
  } catch (error) {
    console.error("Error creating stock history:", error)
    throw error
  }
}

export async function getStockHistoryStats(itemId: string) {
  try {
    const stats = await prisma.stockHistory.groupBy({
      by: ["reason"],
      where: { itemId },
      _count: true,
      _sum: {
        newLevel: true,
        oldLevel: true,
      },
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stock history stats:", error)
    return NextResponse.json(
      { error: "Error fetching stock history stats" },
      { status: 500 }
    )
  }
} 