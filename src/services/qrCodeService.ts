import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function generateQRCode(itemId: string) {
  try {
    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        qrCodes: true,
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Generate a unique URL for the QR code with timestamp and random string
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const qrCodeUrl = `${baseUrl}/i/${item.id}?t=${timestamp}&u=${randomString}`

    // Create QR code record
    const qrCode = await prisma.qRCode.create({
      data: {
        url: qrCodeUrl,
        itemId: item.id,
      },
    })

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error("Error generating QR code:", error)
    return NextResponse.json(
      { error: "Error generating QR code" },
      { status: 500 }
    )
  }
}

export async function getQRCodes(itemId: string) {
  try {
    const qrCodes = await prisma.qRCode.findMany({
      where: { itemId },
      orderBy: { createdAt: "desc" },
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

export async function deleteQRCode(qrCodeId: string) {
  try {
    await prisma.qRCode.delete({
      where: { id: qrCodeId },
    })

    return NextResponse.json({ message: "QR code deleted successfully" })
  } catch (error) {
    console.error("Error deleting QR code:", error)
    return NextResponse.json(
      { error: "Error deleting QR code" },
      { status: 500 }
    )
  }
} 