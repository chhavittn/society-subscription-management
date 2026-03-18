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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'pre-fix',hypothesisId:'H4',location:'src/app/admin/subscriptions/SubscriptionDetailsModal.jsx:render',message:'SubscriptionDetailsModal render',data:{planId:plan?.id??null,planName:plan?.plan_name??null,type:plan?.type??null,amount:plan?.amount??null,duration:plan?.duration_months??null,effective_from:plan?.effective_from??null,description:plan?.description??null,features:plan?.features??null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const description =
    !plan?.description || plan.description === "empty"
      ? "No description provided"
      : plan.description

  const features =
    !plan?.features || plan.features === "empty"
      ? "No features listed"
      : plan.features

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
            Subscription Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">

          <div className="flex justify-between">
            <span className="font-medium">Plan Name:</span>
            <span>{plan.plan_name}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Amount:</span>
            <span>₹{plan.amount}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Duration:</span>
            <span>{plan.duration_months} months</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Effective From:</span>
            <span>{new Date(plan.effective_from).toLocaleDateString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Description:</span>
            <span>{description}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Features:</span>
            <span>{features}</span>
          </div>

        </div>
      </DialogContent>

    </Dialog >

  )
}