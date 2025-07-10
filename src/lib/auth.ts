// Simulated authentication utilities
export interface User {
  id: string
  email: string
  name: string
  image?: string
}

export interface AuthSession {
  user: User | null
  isLoading: boolean
}

// Simulate Google OAuth response
export const simulateGoogleAuth = async (): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    id: "user_" + Date.now(),
    email: "user@example.com",
    name: "John Doe",
    image: "https://lh3.googleusercontent.com/a/default-user=s96-c",
  }
}

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("auth_user")
  return stored ? JSON.parse(stored) : null
}

export const setStoredUser = (user: User | null) => {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("auth_user", JSON.stringify(user))
  } else {
    localStorage.removeItem("auth_user")
  }
}
