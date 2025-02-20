import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function getPublicItem(id: string) {
  try {
    const item = await prisma.item.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        dimensions: true,
        weight: true,
        storageConditions: true,
        handlingInstructions: true,
        stockLevel: true,
        location: true,
        status: true,
        createdAt: true,
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching public item:", error)
    return NextResponse.json(
      { error: "Error fetching public item details" },
      { status: 500 }
    )
  }
} 