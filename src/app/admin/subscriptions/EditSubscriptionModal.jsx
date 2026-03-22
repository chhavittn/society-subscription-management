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

export default function EditSubscriptionModal({ plan, onUpdated }) {

  const [open, setOpen] = useState(false)

  const [amount, setAmount] = useState(plan?.amount || "")

  // Function to get first day of next month
  const getNextMonthFirstDay = () => {
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return nextMonth.toISOString().split("T")[0] // YYYY-MM-DD
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        amount: Number(amount),
        effective_from: getNextMonthFirstDay() // Automatically next month 1st
      }

      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/plan/${plan.id}`,
        payload,
        { withCredentials: true }
      )

      alert("Updated successfully ✅")
      setOpen(false)
      if (data.success && data.plan) {
        onUpdated?.(data.plan, true)
      }
    } catch (error) {
      console.log(error)
      alert(error.response?.data?.message || "Update failed")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button size="sm">Edit</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">

        <DialogHeader>
          <DialogTitle>Update Rate</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Flat Type (READ ONLY) */}
          <div>
            <label className="text-sm font-medium">Flat Type</label>
            <Input
              value={plan?.plan_name || plan?.flat_type || ""}
              disabled
            />
          </div>

          {/* Amount (Editable) */}
          <div>
            <label className="text-sm font-medium">Monthly Rate</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Effective From (Read Only) */}
          <div>
            <label className="text-sm font-medium">Effective From</label>
            <Input
              type="date"
              value={getNextMonthFirstDay()}
              disabled
            />
          </div>

          <Button type="submit" className="w-full">
            Update Rate
          </Button>

        </form>

      </DialogContent>

    </Dialog>
  )
}