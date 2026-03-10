"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  return (
    <Button
      variant="destructive"
      className="w-full"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </Button>
  )
}