"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function SubscriptionTable() {

  const subscriptions = [
    {
      month: "January 2025",
      amount: "₹1500",
      status: "Paid",
      mode: "UPI",
      receipt: "#"
    },
    {
      month: "February 2025",
      amount: "₹1500",
      status: "Paid",
      mode: "Card",
      receipt: "#"
    },
    {
      month: "March 2025",
      amount: "₹1500",
      status: "Pending",
      mode: "-",
      receipt: null
    }
  ]

  return (

    <div className="border rounded-lg">

      <table className="w-full">

        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Month</th>
            <th className="text-left p-3">Amount</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Payment Mode</th>
            <th className="text-left p-3">Receipt</th>
          </tr>
        </thead>

        <tbody>

          {subscriptions.map((sub, index) => (

            <tr key={index} className="border-t">

              <td className="p-3">{sub.month}</td>

              <td className="p-3">{sub.amount}</td>

              <td className="p-3">

                <Badge
                  variant={sub.status === "Paid" ? "default" : "destructive"}
                >
                  {sub.status}
                </Badge>

              </td>

              <td className="p-3">{sub.mode}</td>

              <td className="p-3">

                {sub.receipt ? (
                  <Button size="sm">
                    View Receipt
                  </Button>
                ) : (
                  "-"
                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  )
}