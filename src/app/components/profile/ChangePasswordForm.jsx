"use client"
// after reloading page the admin becomes user
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
export default function ChangePasswordForm() {

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()
  const handleChangePassword = (e) => {

    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    console.log({
      currentPassword,
      newPassword
    })

    alert("Password changed successfully")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    router.push("/profile")
  }

  return (

    <Card className="max-w-md mx-auto mt-8">

      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>

      <CardContent>

        <form
          onSubmit={handleChangePassword}
          className="space-y-4"
          autoComplete="off"
        >

          {/* Hidden inputs to block browser autofill */}
          <input type="text" name="fakeUser" autoComplete="username" style={{ display: "none" }} />
          <input type="password" name="fakePass" autoComplete="current-password" style={{ display: "none" }} />

          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              name="currentPasswordField"
              autoComplete="new-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              name="newPasswordField"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              name="confirmPasswordField"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Change Password
          </Button>

        </form>

      </CardContent>

    </Card>
  )
}