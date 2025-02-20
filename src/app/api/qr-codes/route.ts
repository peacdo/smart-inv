import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const qrCodes = await prisma.qRCode.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        item: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error("Error fetching QR codes:", error)
    return NextResponse.json(
      { error: "Error fetching QR codes" },
      { status: 500 }
    )
  }
} 