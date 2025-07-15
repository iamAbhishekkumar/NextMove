// models/Job.ts

import mongoose, { Schema, Document } from "mongoose";

export type JobStatus =
  | "waiting-for-referral"
  | "applied"
  | "applied-with-referral"
  | "rejected"
  | "selected";

export interface DbJob extends Document {
  id: string;
  userId: string;
  companyName: string;
  jobRole: string;
  jobUrl: string;
  notes: string;
  status: JobStatus;
  createdAt: Date;
}

const JobSchema = new Schema<DbJob>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  companyName: { type: String, required: true },
  jobRole: { type: String, required: true },
  jobUrl: { type: String, required: true },
  notes: { type: String, required: false },
  status: {
    type: String,
    required: true,
    enum: [
      "waiting-for-referral",
      "applied",
      "applied-with-referral",
      "rejected",
      "selected",
    ],
  },
  createdAt: { type: Date, required: true },
});

export default mongoose.models.Job || mongoose.model<DbJob>("Job", JobSchema);
