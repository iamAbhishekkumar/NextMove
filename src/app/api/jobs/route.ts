// /app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import JobModel from "@/models/Job";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const jobs = await JobModel.find({ userId }).sort({ createdAt: -1 }).lean();
  const cleanJobs = jobs.map(({ userId: _, _id, __v, ...job }) => job);

  return NextResponse.json({ jobs: cleanJobs });
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobData = await req.json();

  await dbConnect();

  const job = await JobModel.create({
    ...jobData,
    id: Date.now().toString(),
    createdAt: new Date(),
    userId,
  });

  const { userId: _, _id, __v, ...cleanJob } = job.toObject();
  return NextResponse.json({ job: cleanJob });
}
