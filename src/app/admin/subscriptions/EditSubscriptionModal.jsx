"use client"

import { useState } from "react"
import axios from "axios"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"

export default function EditSubscriptionModal({ plan, onUpdated }) {

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(plan?.amount || "")

  const getNextMonthFirstDay = () => {
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return nextMonth.toISOString().split("T")[0]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const toastId = toast.loading("Updating rate...")

    try {
      const payload = {
        amount: Number(amount),
        effective_from: getNextMonthFirstDay()
      }

      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/plan/${plan.id}`,
        payload,
        { withCredentials: true }
      )

      toast.success("Updated successfully", { id: toastId })
      setOpen(false)

      if (data.success && data.plan) {
        onUpdated?.(data.plan, true)
      }

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Update failed",
        { id: toastId }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button
          size="sm"
          className="admin-btn-primary"
        >
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="admin-modal max-w-md">

        <DialogHeader>
          <DialogTitle className="text-[#2d3436]">
            Update Rate
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm font-medium text-[#636e72]">
              Flat Type
            </label>
            <Input
              value={plan?.plan_name || plan?.flat_type || ""}
              disabled
              className="admin-input"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#636e72]">
              Monthly Rate
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="admin-input"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#636e72]">
              Effective From
            </label>
            <Input
              type="date"
              value={getNextMonthFirstDay()}
              disabled
              className="admin-input"
            />
          </div>

          <Button
            type="submit"
            className="admin-btn-primary w-full"
          >
            Update Rate
          </Button>

        </form>

      </DialogContent>

    </Dialog>
  )
}
