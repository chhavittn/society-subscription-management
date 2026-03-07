"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ChangePasswordForm() {
  const [currentPassword,setCurrentPassword] = useState("")
  const [newPassword,setNewPassword] = useState("")
  const handleChangePassword = (e) => {
    e.preventDefault()
    console.log({
      currentPassword,
      newPassword
    })
    alert("Password changed successfully")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleChangePassword}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e)=>setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
            />
          </div>

          <Button type="submit">
            Change Password
          </Button>

        </form>

      </CardContent>

    </Card>
  )
}