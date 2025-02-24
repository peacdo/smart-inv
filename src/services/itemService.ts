import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createStockHistory } from "./stockHistoryService"
import { ItemStatus, StockUpdateReason } from "@prisma/client"

export async function getItem(id: string) {
  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ error: "Error fetching item" }, { status: 500 })
  }
}

export async function updateItem(request: Request, id: string) {
  try {
    const json = await request.json()
    const {
      name,
      description,
      dimensions,
      weight,
      storageConditions,
      handlingInstructions,
      stockLevel,
      categoryId,
      warehouse,
      aisle,
      shelf,
      expiryDate,
      status,
      minimumStockLevel,
      userId,
    } = json

    const currentItem = await prisma.item.findUnique({
      where: { id },
      select: { stockLevel: true },
    })

    if (!currentItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    let newStatus = status
    if (stockLevel <= 0) {
      newStatus = ItemStatus.OUT_OF_STOCK
    } else if (stockLevel <= minimumStockLevel) {
      newStatus = ItemStatus.LOW_STOCK
    } else if (!status || status === ItemStatus.OUT_OF_STOCK || status === ItemStatus.LOW_STOCK) {
      newStatus = ItemStatus.AVAILABLE
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        dimensions,
        weight,
        storageConditions,
        handlingInstructions,
        stockLevel,
        categoryId,
        warehouse,
        aisle,
        shelf,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: newStatus,
        minimumStockLevel,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        category: true,
      },
    })

    if (currentItem.stockLevel !== stockLevel) {
      await createStockHistory(
        id,
        currentItem.stockLevel,
        stockLevel,
        stockLevel > currentItem.stockLevel ? StockUpdateReason.RESTOCK : StockUpdateReason.ADJUSTMENT,
        userId,
        "Stock level updated"
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: "Error updating item" }, { status: 500 })
  }
}

export async function deleteItem(id: string) {
  try {
    await prisma.item.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ error: "Error deleting item" }, { status: 500 })
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
  return await prisma.stockHistory.create({
    data: {
      itemId,
      oldLevel,
      newLevel,
      reason,
      userId,
      notes,
    },
  })
} 