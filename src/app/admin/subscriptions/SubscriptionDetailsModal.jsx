"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

export default function SubscriptionDetailsModal({ plan }) {

  return (

    <Dialog>

      <DialogTrigger asChild>

        <Button size="sm" variant="outline">
          View Details
        </Button>

      </DialogTrigger>

      <DialogContent className="max-w-md">

        <DialogHeader>
          <DialogTitle>
            {plan.type} Subscription Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">

          <div className="flex justify-between">
            <span className="font-medium">Flat Type:</span>
            <span>{plan.type}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Monthly Cost:</span>
            <span>₹{plan.amount}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Description:</span>
            <span>{plan.description}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Maintenance:</span>
            <span>{plan.maintenance}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Parking:</span>
            <span>{plan.parking}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Support:</span>
            <span>{plan.support}</span>
          </div>

        </div>

      </DialogContent>

    </Dialog>

  )
}