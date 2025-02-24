import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { generateQRCode, getQRCodes, deleteQRCode } from "@/services/qrCodeService"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  return getQRCodes(id)
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  return generateQRCode(id)
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = new URL(request.url).searchParams
  const qrCodeId = searchParams.get("qrCodeId")

  if (!qrCodeId) {
    return NextResponse.json({ error: "QR Code ID is required" }, { status: 400 })
  }

  return deleteQRCode(qrCodeId)
} 