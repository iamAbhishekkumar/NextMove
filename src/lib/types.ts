export type JobStatus = "waiting-for-referral" | "applied" | "applied-with-referral" | "rejected" | "selected"

export interface Job {
  id: string
  companyName: string
  jobRole: string
  jobUrl: string
  notes: string
  status: JobStatus
  createdAt: Date
}
