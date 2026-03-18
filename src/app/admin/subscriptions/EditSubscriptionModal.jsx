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
import { Textarea } from "@/components/ui/textarea"

export default function PlanModal({ plan, onUpdated }) {
  const isEdit = !!plan
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState({
    plan_name: plan?.plan_name || "",
    amount: plan?.amount || "",
    duration_months: plan?.duration_months || "",
    effective_from: plan?.effective_from
      ? plan.effective_from.split("T")[0]
      : "",
    description: plan?.description || "",
    features: plan?.features || ""
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        plan_name: formData.plan_name,
        amount: Number(formData.amount),
        duration_months: Number(formData.duration_months),
        effective_from: formData.effective_from,
        description: formData.description,
        features: formData.features
      }

      let res

      if (isEdit) {
        // ✅ Update existing plan
        res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/plan/${plan.id}`,
          payload,
          { withCredentials: true }
        )
      } else {
        // ✅ Create new plan
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/plans`,
          payload,
          { withCredentials: true }
        )
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'pre-fix',hypothesisId:'H3',location:'src/app/admin/subscriptions/EditSubscriptionModal.jsx:handleSubmit',message:'PlanModal submit success',data:{isEdit,responseKeys:res?.data?Object.keys(res.data):null,planKeys:res?.data?.plan?Object.keys(res.data.plan):null,planId:res?.data?.plan?.id??null,planName:res?.data?.plan?.plan_name??null,descType:typeof res?.data?.plan?.description,featuresType:typeof res?.data?.plan?.features,descValue:typeof res?.data?.plan?.description==='string'?res.data.plan.description.slice(0,40):null,featuresValue:typeof res?.data?.plan?.features==='string'?res.data.plan.features.slice(0,40):null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      alert(isEdit ? "Updated successfully ✅" : "Created successfully ✅")
      setOpen(false)

      // ✅ Pass back the new/updated plan for instant table update
      onUpdated?.(res.data.plan, isEdit)

      // ✅ Reset form after creating new plan
      if (!isEdit) {
        setFormData({
          plan_name: "",
          amount: "",
          duration_months: "",
          effective_from: "",
          description: "",
          features: ""
        })
      }

    } catch (error) {
      console.log(error)
      alert(error.response?.data?.message || "Operation failed")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button size="sm">Edit</Button>
        ) : (
          <Button>Add Plan</Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Plan" : "Create Plan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm font-medium">Plan Name</label>
            <Input
              value={formData.plan_name}
              onChange={(e) => handleChange("plan_name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Duration (Months)</label>
            <Input
              type="number"
              value={formData.duration_months}
              onChange={(e) => handleChange("duration_months", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Effective From</label>
            <Input
              type="date"
              value={formData.effective_from}
              onChange={(e) => handleChange("effective_from", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Features (comma separated)</label>
            <Textarea
              value={formData.features}
              onChange={(e) => handleChange("features", e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            {isEdit ? "Update Plan" : "Create Plan"}
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  )
}