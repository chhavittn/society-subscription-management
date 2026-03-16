"use client"

import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSession } from "next-auth/react"

import AdminSidebar from "./AdminSidebar"
import UserSidebar from "./UserSidebar"

export default function Sidebar() {

  const router = useRouter()

  const { data: session, status } = useSession()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const role = user?.role || session?.user?.role || "user"

  useEffect(() => {

    if (status === "loading") return

    if (!session && !isAuthenticated) {
      router.push("/login")
    }

  }, [session, status, isAuthenticated, router])

  if (status === "loading") return null

  if (!session && !isAuthenticated) return null

  if (role === "admin") {
    return <AdminSidebar />
  }

  return <UserSidebar />
}