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
import toast from "react-hot-toast";

export default function FlatFormModal({
  mode = "add",
  existingFlat = null,
  onClose,
  onCreated,
  onUpdated,
}) {
  // Flat fields
  const [flatNumber, setFlatNumber] = useState("")
  const [block, setBlock] = useState("")
  const [floor, setFloor] = useState("")
  const [flatType, setFlatType] = useState("")

  // ✅ NEW: Owner fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  // ✅ Prefill for edit
  useEffect(() => {
    if (existingFlat) {
      setFlatNumber(existingFlat.flat_number || "")
      setBlock(existingFlat.block || "")
      setFloor(existingFlat.floor || "")
      setFlatType(existingFlat.flat_type || "")

      // 👇 NEW
      setName(existingFlat.user_name || "")
      setEmail(existingFlat.user_email || "")
      setPhone(existingFlat.user_phone || "")
    }
  }, [existingFlat])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!flatNumber || !block || !floor || !flatType) {
      toast.error("Please fill all required flat details");
      return
    }

    const parsedFloor = parseInt(floor, 10)
    if (Number.isNaN(parsedFloor)) {
      toast.error("Floor must be a valid number");
      return
    }
    const toastId = toast.loading(
      mode === "edit" ? "Updating flat..." : "Creating flat..."
    );

    setSubmitting(true)

    try {
      const payload = {
        flat_number: flatNumber,
        block,
        floor: parsedFloor,
        flat_type: flatType,
        name,
        email,
        phone,
      }

      if (mode === "edit" && existingFlat) {
        const res = await axios.put(
          `http://localhost:5000/api/v1/admin/flat/${existingFlat.id}`,
          {
            ...payload,
            is_active: existingFlat.is_active ?? true,
          },
          { withCredentials: true }
        )

        onUpdated?.(res.data.flat)
        toast.success("Flat updated successfully ", { id: toastId });
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/v1/admin/flat",
          payload,
          { withCredentials: true }
        )

        onCreated?.(res.data.flat)
        toast.success("Flat added successfully ", { id: toastId });
      }

      // ✅ Reset form
      setFlatNumber("")
      setBlock("")
      setFloor("")
      setFlatType("")
      setName("")
      setEmail("")
      setPhone("")

      if (mode === "add") {
        setOpen(false)   // ✅ close add modal
      } else {
        onClose?.()      // ✅ close edit modal (parent controlled)
      }

    } catch (error) {
      console.log(error)
      toast.error(
        error.response?.data?.message || "Failed to save flat ",
        { id: toastId }
      );
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={mode === "edit" ? !!existingFlat : open}
      onOpenChange={(val) => {
        if (mode === "add") setOpen(val)
        if (!val) onClose?.()
      }}
    >
      <DialogTrigger asChild>
        {mode === "add" && (
          <Button onClick={() => setOpen(true)}>Add Flat</Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Flat" : "Add Flat"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Flat fields */}
          <Input
            placeholder="Flat Number"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
          />

          <Input
            placeholder="Block"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
          />

          <Input
            placeholder="Floor"
            type="number"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          />

          <Input
            placeholder="Flat Type"
            value={flatType}
            onChange={(e) => setFlatType(e.target.value)}
          />

          {/* 🔥 NEW: Owner Section */}
          <div className="border-t pt-3 space-y-3">
            <p className="text-sm font-semibold text-gray-600">
              Owner Details
            </p>

            <Input
              placeholder="Owner Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              placeholder="Owner Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder="Owner Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>

            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update Flat"
                  : "Save Flat"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}