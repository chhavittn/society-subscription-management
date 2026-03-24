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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[0-9]{10}$/
const blockOptions = ["A", "B", "C", "D", "E", "F", "G", "H"]
const flatTypeOptions = ["1BHK", "2BHK", "3BHK", "4BHK"]
const digitsOnly = (value) => value.replace(/\D/g, "")

export default function FlatFormModal({
  mode = "add",
  existingFlat = null,
  onClose,
  onCreated,
  onUpdated,
}) {
  const [flatNumber, setFlatNumber] = useState("")
  const [block, setBlock] = useState("")
  const [floor, setFloor] = useState("")
  const [flatType, setFlatType] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (existingFlat) {
      setFlatNumber(existingFlat.flat_number || "")
      setBlock(existingFlat.block || "")
      setFloor(existingFlat.floor || "")
      setFlatType(existingFlat.flat_type || "")
      setName(existingFlat.user_name || "")
      setEmail(existingFlat.user_email || "")
      setPhone(existingFlat.user_phone || "")
    }
  }, [existingFlat])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedFlatNumber = flatNumber.trim()
    const trimmedBlock = block.trim()
    const trimmedFlatType = flatType.trim()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPhone = phone.trim()

    if (!trimmedFlatNumber || !trimmedBlock || floor === "" || !trimmedFlatType) {
      toast.error("Please fill all required flat details")
      return
    }

    const parsedFloor = parseInt(floor, 10)
    if (Number.isNaN(parsedFloor) || parsedFloor < 0) {
      toast.error("Floor must be a valid non-negative number")
      return
    }

    const hasOwnerDetails = trimmedName || trimmedEmail || trimmedPhone

    if (hasOwnerDetails && (!trimmedName || !trimmedEmail || !trimmedPhone)) {
      toast.error("Please fill all owner details or leave them all empty")
      return
    }

    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid owner email")
      return
    }

    if (trimmedPhone && !phoneRegex.test(trimmedPhone)) {
      toast.error("Owner phone must be exactly 10 digits")
      return
    }

    const toastId = toast.loading(
      mode === "edit" ? "Updating flat..." : "Creating flat..."
    );

    setSubmitting(true)

    try {
      const payload = {
        flat_number: trimmedFlatNumber,
        block: trimmedBlock,
        floor: parsedFloor,
        flat_type: trimmedFlatType,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
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
        toast.success("Flat updated successfully", { id: toastId });
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/v1/admin/flat",
          payload,
          { withCredentials: true }
        )

        onCreated?.(res.data.flat)
        toast.success("Flat added successfully", { id: toastId });
      }

      setFlatNumber("")
      setBlock("")
      setFloor("")
      setFlatType("")
      setName("")
      setEmail("")
      setPhone("")

      if (mode === "add") setOpen(false)
      else onClose?.()

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save flat",
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
          <Button className="admin-btn-secondary">
            Add Flat
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="admin-modal max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#2d3436] text-xl">
            {mode === "edit" ? "Edit Flat" : "Add Flat"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Flat Number"
              className="admin-input"
              value={flatNumber}
              inputMode="numeric"
              onChange={(e) => setFlatNumber(digitsOnly(e.target.value))}
            />
            <select
              className="admin-native-select"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
            >
              <option value="">Select Block</option>
              {blockOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Floor"
              type="text"
              className="admin-input"
              value={floor}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => setFloor(digitsOnly(e.target.value))}
            />
            <select
              className="admin-native-select"
              value={flatType}
              onChange={(e) => setFlatType(e.target.value)}
            >
              <option value="">Select Flat Type</option>
              {flatTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-[#dfe6e9] pt-4 space-y-4">
            <p className="text-sm font-semibold text-[#636e72]">
              Owner Details
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Owner Name"
                className="admin-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Owner Email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Input
              placeholder="Owner Phone"
              className="admin-input"
              value={phone}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => setPhone(digitsOnly(e.target.value).slice(0, 10))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button
                type="button"
                className="admin-btn-ghost"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={submitting}
              className="admin-btn-primary"
            >
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
