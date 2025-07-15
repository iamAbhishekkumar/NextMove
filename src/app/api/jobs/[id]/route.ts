// /app/api/jobs/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import JobModel from "@/models/Job";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = req.headers.get("x-user-id");
  const { id: jobId } = await params;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!jobId)
    return NextResponse.json({ error: "Missing job ID" }, { status: 400 });

  const updates = await req.json();

  try {
    await dbConnect();

    const updated = await JobModel.findOneAndUpdate(
      { id: jobId, userId },
      updates,
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { userId: _, _id, __v, ...cleanJob } = updated as any;
    return NextResponse.json({ job: cleanJob });
  } catch (err) {
    console.error("PUT /api/jobs/:id error:", err);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = req.headers.get("x-user-id");
  const { id: jobId } = await params;

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!jobId)
    return NextResponse.json({ error: "Missing job ID" }, { status: 400 });

  try {
    await dbConnect();

    const result = await JobModel.deleteOne({ id: jobId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/jobs/:id error:", err);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
