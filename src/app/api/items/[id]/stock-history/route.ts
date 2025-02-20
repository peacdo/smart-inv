import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { getStockHistory, getStockHistoryStats } from "@/services/stockHistoryService"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session || !["ADMIN", "WORKER1"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const url = new URL(request.url)
  const type = url.searchParams.get("type")

  if (type === "stats") {
    return getStockHistoryStats(id)
  }

  return getStockHistory(id)
} 