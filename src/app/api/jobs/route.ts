import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id")

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const jobs = await db.findJobsByUserId(userId)
    return NextResponse.json({ jobs })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id")

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const jobData = await request.json()
    const job = await db.createJob(userId, jobData)
    return NextResponse.json({ job })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
