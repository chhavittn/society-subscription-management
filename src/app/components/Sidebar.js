"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AdminSidebar from "./AdminSidebar"
import UserSidebar from "./UserSidebar"

export default function Sidebar({ role }) {

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") return null

  if (!session) return null

  const roleType = session?.user?.role

  if (roleType === "admin" || role === "admin") {
    return <AdminSidebar />
  }

  return <UserSidebar />
}