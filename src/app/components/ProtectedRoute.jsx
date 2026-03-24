"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

export default function ProtectedRoute({ children, allowedRoles = null, redirectTo = "/login" }) {

  const { data: session, status } = useSession()
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth)
  const router = useRouter()
  const role = user?.role ?? session?.user?.role
  const hasRoleAccess =
    !allowedRoles || (role && allowedRoles.includes(role))

  useEffect(() => {

    if (status === "loading" || loading) return

    if (!session && !isAuthenticated) {
      toast.error("You are not allowed to access this page. Please login.")
      router.push(redirectTo)
      return
    }

    if ((session || isAuthenticated) && allowedRoles && role && !hasRoleAccess) {
      toast.error("You are not allowed to access this page.")
      router.push(role === "admin" ? "/admin/dashboard" : "/user/dashboard")
    }

  }, [session, status, isAuthenticated, loading, router, allowedRoles, redirectTo, role, hasRoleAccess])

  if (status === "loading" || loading) {
    return <p>Loading...</p>
  }

  if (!session && !isAuthenticated) return null
  if (allowedRoles && role && !hasRoleAccess) return null

  return children
}
