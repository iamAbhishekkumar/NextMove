// Simulated MongoDB operations
import type { Job } from "./types"

export interface DbJob extends Job {
  userId: string
}

// Simulate MongoDB collection
class SimulatedMongoDB {
  private jobs: DbJob[] = []

  constructor() {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jobs_db")
      if (stored) {
        this.jobs = JSON.parse(stored)
      }
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      localStorage.setItem("jobs_db", JSON.stringify(this.jobs))
    }
  }

  async findJobsByUserId(userId: string): Promise<Job[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return this.jobs
      .filter((job) => job.userId === userId)
      .map(({ userId, ...job }) => job)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async createJob(userId: string, jobData: Omit<Job, "id" | "createdAt">): Promise<Job> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const newJob: DbJob = {
      ...jobData,
      id: Date.now().toString(),
      createdAt: new Date(),
      userId,
    }

    this.jobs.push(newJob)
    this.save()

    const { userId: _, ...job } = newJob
    return job
  }

  async updateJob(userId: string, jobId: string, updates: Partial<Job>): Promise<Job | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const jobIndex = this.jobs.findIndex((job) => job.id === jobId && job.userId === userId)
    if (jobIndex === -1) return null

    this.jobs[jobIndex] = { ...this.jobs[jobIndex], ...updates }
    this.save()

    const { userId: _, ...job } = this.jobs[jobIndex]
    return job
  }

  async deleteJob(userId: string, jobId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const initialLength = this.jobs.length
    this.jobs = this.jobs.filter((job) => !(job.id === jobId && job.userId === userId))
    this.save()

    return this.jobs.length < initialLength
  }
}

export const db = new SimulatedMongoDB()
