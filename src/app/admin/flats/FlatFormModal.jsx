"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function FlatFormModal() {

  const [flatNumber,setFlatNumber] = useState("")
  const [owner,setOwner] = useState("")
  const [email,setEmail] = useState("")
  const [phone,setPhone] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    console.log({
      flatNumber,
      owner,
      email,
      phone
    })

    alert("Flat saved")
  }

  return (
    <Dialog>

      <DialogTrigger asChild>
        <Button>Add Flat</Button>
      </DialogTrigger>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>Add Flat</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <Input
            placeholder="Flat Number"
            value={flatNumber}
            onChange={(e)=>setFlatNumber(e.target.value)}
          />

          <Input
            placeholder="Owner Name"
            value={owner}
            onChange={(e)=>setOwner(e.target.value)}
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
          />

          <Button type="submit">
            Save Flat
          </Button>

        </form>

      </DialogContent>

    </Dialog>
  )
}