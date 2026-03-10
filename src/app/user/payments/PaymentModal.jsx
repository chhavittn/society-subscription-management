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
import Receipt from "./ReceiptModal"

export default function PaymentModal({ amount }) {

  const [success, setSuccess] = useState(false)

  return (

    <Dialog>

      <DialogTrigger asChild>
        <Button className="w-full">
          Pay Now
        </Button>
      </DialogTrigger>

      <DialogContent>

        {!success ? (

          <div className="space-y-4">

            <DialogHeader>
              <DialogTitle>
                Mock Payment Gateway
              </DialogTitle>
            </DialogHeader>

            <p>
              Amount: ₹{amount}
            </p>

            <Button
              className="w-full"
              onClick={()=>setSuccess(true)}
            >
              Complete Payment
            </Button>

          </div>

        ) : (

          <Receipt amount={amount} />

        )}

      </DialogContent>

    </Dialog>
  )
}