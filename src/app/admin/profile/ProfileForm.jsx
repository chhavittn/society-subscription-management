"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ProfileForm() {

  const [name,setName] = useState("Admin User")
  const [email,setEmail] = useState("admin@society.com")
  const [phone,setPhone] = useState("9876543210")

  const handleUpdate = (e) => {
    e.preventDefault()

    console.log({ name,email,phone })

    alert("Profile updated successfully")
  }

  return (

    <Card>

      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>

      <CardContent>

        <form
          onSubmit={handleUpdate}
          className="space-y-4"
        >

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e)=>setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
            />
          </div>

          <Button type="submit">
            Update Profile
          </Button>

        </form>

      </CardContent>

    </Card>
  )
}