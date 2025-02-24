import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateData, itemSchema } from "@/lib/utils/validation"
import { APIError } from "@/lib/utils/api-error"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await prisma.item.findMany({
      include: {
        category: true,
        supplier: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json(
      { error: "Error fetching items" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const validatedData = await validateData(itemSchema, json)

    // Convert validated data to the correct types
    const itemData = {
      name: validatedData.name,
      description: validatedData.description,
      dimensions: validatedData.dimensions,
      weight: typeof validatedData.weight === 'string' ? parseFloat(validatedData.weight) : validatedData.weight,
      storageConditions: validatedData.storageConditions,
      handlingInstructions: validatedData.handlingInstructions,
      stockLevel: typeof validatedData.stockLevel === 'string' ? parseInt(validatedData.stockLevel) : validatedData.stockLevel,
      warehouse: validatedData.warehouse,
      aisle: validatedData.aisle,
      shelf: validatedData.shelf,
      expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
      status: validatedData.status,
      supplierId: validatedData.supplierId,
      categoryId: validatedData.categoryId,
      userId: session.user.id,
    }

    // Create the item
    const item = await prisma.item.create({
      data: itemData,
      include: {
        category: true,
        supplier: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error creating item:", error)
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }
    return NextResponse.json(
      { error: "Error creating item" },
      { status: 500 }
    )
  }
} 