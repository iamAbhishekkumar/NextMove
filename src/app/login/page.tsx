"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Briefcase, Chrome } from "lucide-react"

export default function LoginPage() {
  const { user, isLoading, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Job Tracker</CardTitle>
          <CardDescription>Sign in with your Google account to start tracking your job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={signIn} disabled={isLoading} className="w-full" size="lg">
            <Chrome className="w-5 h-5 mr-2" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
