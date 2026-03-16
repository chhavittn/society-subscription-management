"use client"

import { useState, useEffect } from "react"
import axios from "axios"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { useRouter } from "next/navigation"
export default function ProfileForm() {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // Load user profile
  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const { data } = await axios.get(
          "http://localhost:5000/api/v1/me",
          { withCredentials: true }
        )

        const user = data.user

        setName(user.name || "")
        setEmail(user.email || "")
        setPhone(user.phone || "")

        setLoading(false)

      } catch (error) {

        console.log(error)
        setLoading(false)

      }

    }

    fetchProfile()

  }, [])

  const handleUpdate = async (e) => {

    e.preventDefault()

    try {

      const { data } = await axios.put(
        "http://localhost:5000/api/v1/me/update",
        { name, email, phone },
        { withCredentials: true }
      )

      alert("Profile updated successfully")

      router.push("/profile")

    } catch (error) {

      console.log(error)
      alert(error.response?.data?.message || "Update failed")

    }

  }

  if (loading) {
    return <p>Loading profile...</p>
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
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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