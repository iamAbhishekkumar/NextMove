import { type NextRequest, NextResponse } from "next/server"
import { simulateGoogleAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Simulate Google OAuth flow
    const user = await simulateGoogleAuth()

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
