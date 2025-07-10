"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/auth"
import { getStoredUser, setStoredUser } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = getStoredUser()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  const signIn = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
      })
      const data = await response.json()

      if (data.user) {
        setUser(data.user)
        setStoredUser(data.user)
      }
    } catch (error) {
      console.error("Sign in failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    setStoredUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
