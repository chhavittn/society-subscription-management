"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SubscriptionStatus() {

  const status = "Pending"
  const pendingAmount = "₹1500"

  return (
    <Card>

      <CardHeader>
        <CardTitle>
          Current Month Subscription
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        <div className="flex justify-between">

          <p>Status</p>

          <Badge
            variant={status === "Paid" ? "default" : "destructive"}
          >
            {status}
          </Badge>

        </div>

        <div className="flex justify-between">

          <p>Pending Amount</p>

          <p className="font-bold text-lg">
            {pendingAmount}
          </p>

        </div>

      </CardContent>

    </Card>
  )
}