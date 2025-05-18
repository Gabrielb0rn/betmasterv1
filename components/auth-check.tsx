"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

type AuthCheckProps = {
  children: React.ReactNode
  adminOnly?: boolean
  redirectTo?: string
}

export default function AuthCheck({ children, adminOnly = false, redirectTo = "/auth/login" }: AuthCheckProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser()

        if (!user) {
          router.push(redirectTo)
          return
        }

        if (adminOnly && !user.isAdmin) {
          router.push("/dashboard")
          return
        }

        setAuthorized(true)
      } catch (error) {
        console.error("Error checking authentication:", error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [adminOnly, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  return authorized ? <>{children}</> : null
}
