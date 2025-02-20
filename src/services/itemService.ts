import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createStockHistory } from "./stockHistoryService"
import { ItemStatus } from "@prisma/client"

export async function getItem(id: string) {
  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        category: true,
        qrCodes: true,
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
      userId, // Added to track who made the change
    } = json

    // Get the current item to compare stock levels
    const currentItem = await prisma.item.findUnique({
      where: { id },
      select: { stockLevel: true },
    })

    if (!currentItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Determine the new status based on stock level and minimum stock level
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

    // Create stock history if stock level changed
    if (currentItem.stockLevel !== stockLevel) {
      await createStockHistory(
        id,
        currentItem.stockLevel,
        stockLevel,
        stockLevel > currentItem.stockLevel ? "RESTOCK" : "ADJUSTMENT",
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

export async function deleteItem(id: string, session: any) {
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // First delete all associated QR codes and stock history
    await prisma.qRCode.deleteMany({
      where: { itemId: id },
    })

    await prisma.stockHistory.deleteMany({
      where: { itemId: id },
    })

    // Then delete the item
    await prisma.item.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ error: "Error deleting item" }, { status: 500 })
  }
} 