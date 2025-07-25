"use client";

import { DialogTrigger } from "@/components/ui/dialog";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ExternalLink,
  Building2,
  Briefcase,
  FileText,
  Trash2,
  Filter,
  LogOut,
  User,
} from "lucide-react";
import { z } from "zod"; // Import zod
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/auth-provider";
import type { Job, JobStatus } from "@/lib/types";

// Define the Zod schema for job application form data
const jobFormSchema = z.object({
  companyName: z.string().min(1, "Company Name is required."),
  jobRole: z.string().min(1, "Job Role is required."),
  jobUrl: z.url("Invalid URL format.").optional().or(z.literal("")),
  notes: z.string().optional(),
  status: z.enum([
    "waiting-for-referral",
    "applied",
    "applied-with-referral",
    "rejected",
    "selected",
  ]),
});

type JobFormData = z.infer<typeof jobFormSchema>;

const statusConfig = {
  "waiting-for-referral": {
    label: "Waiting for Referral",
    variant: "secondary" as const,
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  applied: {
    label: "Applied",
    variant: "default" as const,
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  "applied-with-referral": {
    label: "Applied with Referral",
    variant: "default" as const,
    className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 hover:bg-red-200",
  },
  selected: {
    label: "Selected",
    variant: "default" as const,
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
};

export default function JobTracker() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    companyName: "",
    jobRole: "",
    jobUrl: "",
    notes: "",
    status: "applied", // Default status
  });
  const [formErrors, setFormErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    try {
      const response = await fetch("/api/jobs", {
        headers: {
          "x-user-id": user.email!,
        },
      });
      const data = await response.json();
      if (data.jobs) {
        setJobs(
          data.jobs.map((job: Job) => ({
            ...job,
            createdAt: new Date(job.createdAt),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const filteredJobs = useMemo(() => {
    if (statusFilter === "all") return jobs;
    return jobs.filter((job) => job.status === statusFilter);
  }, [jobs, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({}); // Clear previous errors

    const validationResult = jobFormSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path.length > 0) {
          const path = err.path.join(".");
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path]!.push(err.message);
        }
      });
      setFormErrors(fieldErrors);
      return;
    }

    if (!user) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingJob) {
        // Update existing job
        const response = await fetch(`/api/jobs/${editingJob.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.email!,
          },
          body: JSON.stringify(validationResult.data), // Use validated data
        });
        if (response.ok) {
          const data = await response.json();
          setJobs((prev) =>
            prev.map((job) =>
              job.id === editingJob.id
                ? { ...data.job, createdAt: new Date(data.job.createdAt) }
                : job
            )
          );
        }
      } else {
        // Add new job
        const response = await fetch("/api/jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.email!,
          },
          body: JSON.stringify(validationResult.data), // Use validated data
        });
        if (response.ok) {
          const data = await response.json();
          setJobs((prev) => [
            { ...data.job, createdAt: new Date(data.job.createdAt) },
            ...prev,
          ]);
        }
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save job:", error);
      // Optionally set a generic form error here
      setFormErrors({
        _general: ["An unexpected error occurred. Please try again."],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof JobFormData,
    value: string | JobStatus
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (job: Job) => {
    setFormData({
      companyName: job.companyName,
      jobRole: job.jobRole,
      jobUrl: job.jobUrl,
      notes: job.notes,
      status: job.status,
    });
    setEditingJob(job);
    setFormErrors({}); // Clear errors when opening for edit
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.email!,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId ? { ...job, status: newStatus } : job
          )
        );
      }
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.email!,
        },
      });

      if (response.ok) {
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      jobRole: "",
      jobUrl: "",
      notes: "",
      status: "applied", // Reset to default status
    });
    setEditingJob(null);
    setFormErrors({}); // Clear errors on reset
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Job Tracker
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Welcome back, {user.name}! Track your job applications and their
                status
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm(); // Reset form when dialog closes
                }}
              >
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Application
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[400px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
                  <div className="p-6 pb-0 flex-shrink-0">
                    <DialogHeader>
                      <DialogTitle>
                        {editingJob
                          ? "Edit Application"
                          : "Add New Job Application"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingJob
                          ? "Update your job application details."
                          : "Fill in the details of your job application."}
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <ScrollArea className="flex-1 px-6 pb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name *</Label>
                        <Input
                          id="company"
                          value={formData.companyName}
                          onChange={(e) =>
                            handleInputChange("companyName", e.target.value)
                          }
                          placeholder="e.g. Google, Microsoft"
                          required
                          className="w-full"
                        />
                        {formErrors.companyName && (
                          <p className="text-red-500 text-sm">
                            {formErrors.companyName[0]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Job Role *</Label>
                        <Input
                          id="role"
                          value={formData.jobRole}
                          onChange={(e) =>
                            handleInputChange("jobRole", e.target.value)
                          }
                          placeholder="e.g. Software Engineer, Product Manager"
                          required
                          className="w-full"
                        />
                        {formErrors.jobRole && (
                          <p className="text-red-500 text-sm">
                            {formErrors.jobRole[0]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="url">Job URL</Label>
                        <Input
                          id="url"
                          type="url"
                          value={formData.jobUrl}
                          onChange={(e) =>
                            handleInputChange("jobUrl", e.target.value)
                          }
                          placeholder="https://..."
                          className="w-full"
                        />
                        {formErrors.jobUrl && (
                          <p className="text-red-500 text-sm">
                            {formErrors.jobUrl[0]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: JobStatus) =>
                            handleInputChange("status", value)
                          }
                          required
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="waiting-for-referral">
                              Waiting for Referral
                            </SelectItem>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="applied-with-referral">
                              Applied with Referral
                            </SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="selected">Selected</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.status && (
                          <p className="text-red-500 text-sm">
                            {formErrors.status[0]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) =>
                            handleInputChange("notes", e.target.value)
                          }
                          placeholder="Any additional notes..."
                          className="w-full min-h-[80px] max-h-[120px] resize-none overflow-y-auto"
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            whiteSpace: "pre-wrap",
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height =
                              Math.min(target.scrollHeight, 70) + "px";
                          }}
                        />
                        {formErrors.notes && (
                          <p className="text-red-500 text-sm">
                            {formErrors.notes[0]}
                          </p>
                        )}
                      </div>

                      {formErrors._general && (
                        <p className="text-red-500 text-sm">
                          {formErrors._general[0]}
                        </p>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting
                            ? "Saving..."
                            : editingJob
                            ? "Update Application"
                            : "Add Application"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            resetForm();
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filter */}
          {jobs.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(value: JobStatus | "all") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="waiting-for-referral">
                    Waiting for Referral
                  </SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="applied-with-referral">
                    Applied with Referral
                  </SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Job Applications List */}
        {jobs.length === 0 ? (
          <Card className="text-center py-8 sm:py-12">
            <CardContent>
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No applications yet
              </h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Start tracking your job applications by adding your first one.
              </p>
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Application
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">
                {statusFilter === "all"
                  ? `Applications (${jobs.length})`
                  : `${statusConfig[statusFilter as JobStatus]?.label} (${
                      filteredJobs.length
                    })`}
              </h2>
            </div>
            <ScrollArea className="h-[calc(100vh-250px)] sm:h-[calc(100vh-300px)]">
              <div className="space-y-4 pr-4">
                {filteredJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">
                                {job.companyName}
                              </span>
                            </CardTitle>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Briefcase className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm truncate">
                                {job.jobRole}
                              </span>
                            </div>
                          </div>
                          <Badge className={statusConfig[job.status].className}>
                            {statusConfig[job.status].label}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Select
                            value={job.status}
                            onValueChange={(value: JobStatus) =>
                              handleStatusChange(job.id, value)
                            }
                          >
                            <SelectTrigger className="w-full sm:w-[180px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="waiting-for-referral">
                                Waiting for Referral
                              </SelectItem>
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="applied-with-referral">
                                Applied with Referral
                              </SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="selected">Selected</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(job)}
                              className="h-8 flex-1 sm:flex-none"
                            >
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 flex-1 sm:flex-none bg-transparent"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="w-[95vw] max-w-[400px]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Application
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the
                                    application for {job.jobRole} at{" "}
                                    {job.companyName}? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(job.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {job.jobUrl && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <a
                              href={job.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate"
                            >
                              View Job Posting
                            </a>
                          </div>
                        )}
                        {job.notes && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-muted-foreground break-words whitespace-pre-wrap overflow-hidden">
                              {job.notes}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Added on {job.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
