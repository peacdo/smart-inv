import { NextResponse } from "next/server"
import { getPublicItem } from "@/services/publicItemService"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return getPublicItem(id)
} 