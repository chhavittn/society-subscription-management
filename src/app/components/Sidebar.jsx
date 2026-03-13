"use client"

import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AdminSidebar from "./AdminSidebar"
import UserSidebar from "./UserSidebar"

export default function Sidebar() {

  const router = useRouter()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  if (user?.role === "admin") {
    return <AdminSidebar />
  }

  return <UserSidebar />
}