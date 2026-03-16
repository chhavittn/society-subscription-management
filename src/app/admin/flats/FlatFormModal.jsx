"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios"

export default function FlatFormModal({
  mode = "add", // "add" | "edit-contact"
  existingFlat = null,
  onClose,
  onCreated,
  onUpdated,
}) {
  // State for form fields
  const [flatNumber, setFlatNumber] = useState("")
  const [block, setBlock] = useState("")
  const [floor, setFloor] = useState("")
  const [flatType, setFlatType] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // If editing, prefill the form
  useEffect(() => {
    if (existingFlat) {
      setFlatNumber(existingFlat.flat_number || "")
      setBlock(existingFlat.block || "")
      setFloor(existingFlat.floor || "")
      setFlatType(existingFlat.flat_type || "")
      setEmail(existingFlat.user_email || "")
      setPhone(existingFlat.user_phone || "")
    }
  }, [existingFlat])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (mode === "edit-contact") {
        const res = await axios.put(
          `http://localhost:5000/api/v1/admin/flat/${existingFlat.id}/contact`,
          { user_email: email, user_phone: phone },
          { withCredentials: true }
        )
        onUpdated?.(res.data.flat)
        alert("Contact updated successfully")
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/v1/admin/flat",
          {
            flat_number: flatNumber,
            block,
            floor: parseInt(floor),
            flat_type: flatType,
          },
          { withCredentials: true }
        )
        onCreated?.(res.data.flat)
        alert("Flat added successfully")
      }

      // Reset form
      setFlatNumber("")
      setBlock("")
      setFloor("")
      setFlatType("")
      setEmail("")
      setPhone("")

      // Close modal
      if (onClose) onClose()

    } catch (error) {
      console.log(error)
      alert(error.response?.data?.message || "Failed to save flat")
    }
  }

  return (
    <Dialog
      open={mode === "edit-contact" ? !!existingFlat : undefined}
      onOpenChange={(open) => {
        if (!open) onClose?.()
      }}
    >
      <DialogTrigger asChild>
        {mode === "add" && <Button>Add Flat</Button>}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit-contact" ? "Edit Contact" : "Add Flat"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Flat Number"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
            readOnly={mode === "edit-contact"}
          />

          <Input
            placeholder="Block"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            readOnly={mode === "edit-contact"}
          />

          <Input
            placeholder="Floor"
            type="number"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            readOnly={mode === "edit-contact"}
          />

          <Input
            placeholder="Flat Type"
            value={flatType}
            onChange={(e) => setFlatType(e.target.value)}
            readOnly={mode === "edit-contact"}
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">
              {mode === "edit-contact" ? "Update" : "Save Flat"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}