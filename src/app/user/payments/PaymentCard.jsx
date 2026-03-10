"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PaymentModal from "./PaymentModal"

export default function PaymentCard() {

  const amount = 1500

  return (
    <Card className="w-[400px]">

      <CardHeader>
        <CardTitle>
          Society Subscription
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        <p className="text-gray-600">
          Pending Amount
        </p>

        <p className="text-3xl font-bold">
          ₹{amount}
        </p>

        <PaymentModal amount={amount} />

      </CardContent>

    </Card>
  )
}