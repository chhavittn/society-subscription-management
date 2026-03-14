"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSelector } from "react-redux"

export default function ProtectedRoute({ children }) {

  const { data: session, status } = useSession()
  const { isAuthenticated, loading } = useSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {

    if (status === "loading" || loading) return

    if (!session && !isAuthenticated) {
      router.push("/login")
    }

  }, [session, status, isAuthenticated, loading, router])

  if (status === "loading" || loading) {
    return <p>Loading...</p>
  }

  if (!session && !isAuthenticated) return null

  return children
}