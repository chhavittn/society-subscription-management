"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfileForm() {

  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [success, setSuccess] = useState(false)

  const handleUpdate = (e) => {
    e.preventDefault()

    console.log("Updated phone:", phone)
    console.log("Updated password:", password)

    // call backend API here, example:
    // PATCH /api/user/profile { phone, password }

    setSuccess(true)

    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
      </CardHeader>
      <CardContent>

        {success && (
          <p className="text-green-600 font-medium mb-4">
            Profile updated successfully!
          </p>
        )}

        <form className="space-y-4" onSubmit={handleUpdate}>

          <Input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <Input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <Button type="submit" className="w-full">
            Update Profile
          </Button>

        </form>

      </CardContent>
    </Card>
  )
}