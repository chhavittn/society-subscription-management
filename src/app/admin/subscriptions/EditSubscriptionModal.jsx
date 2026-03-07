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
import { Textarea } from "@/components/ui/textarea"

export default function EditSubscriptionModal({ plan }) {

  const [formData,setFormData] = useState({
    type: plan.type,
    amount: plan.amount,
    description: plan.description,
    maintenance: plan.maintenance,
    parking: plan.parking,
    support: plan.support
  })

  const handleChange = (field,value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    console.log({
      id: plan.id,
      ...formData
    })
    alert("Subscription updated")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">

        <DialogHeader>
          <DialogTitle>
            Edit {plan.type} Subscription
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleUpdate}
          className="space-y-4"
        >

          <div>
            <label className="text-sm font-medium">
              Flat Type
            </label>
            <Input
              value={formData.type}
              onChange={(e)=>handleChange("type",e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Monthly Amount
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e)=>handleChange("amount",e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e)=>handleChange("description",e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Maintenance Services
            </label>
            <Input
              value={formData.maintenance}
              onChange={(e)=>handleChange("maintenance",e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Parking
            </label>
            <Input
              value={formData.parking}
              onChange={(e)=>handleChange("parking",e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Support
            </label>
            <Input
              value={formData.support}
              onChange={(e)=>handleChange("support",e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>

        </form>

      </DialogContent>

    </Dialog>
  )
}