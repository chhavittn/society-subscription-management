"use client"

import { useSession } from "next-auth/react"
import AdminSidebar from "./AdminSidebar"
import UserSidebar from "./UserSidebar"

export default function Sidebar({role}) {

  const { data: session } = useSession()

  if (!session) return null

  const roleType = session.user.role

  if (roleType || role === "admin") {
    return <AdminSidebar />
  }

  return <UserSidebar />
}