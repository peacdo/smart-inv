import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth/auth-options"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await prisma.item.findMany({
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
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
    const {
      name,
      description,
      dimensions,
      weight,
      storageConditions,
      handlingInstructions,
      stockLevel,
      location,
      expiryDate,
    } = json

    const item = await prisma.item.create({
      data: {
        name,
        description,
        dimensions,
        weight,
        storageConditions,
        handlingInstructions,
        stockLevel,
        location,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        userId: session.user.id,
      },
      include: {
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
    return NextResponse.json(
      { error: "Error creating item" },
      { status: 500 }
    )
  }
} 