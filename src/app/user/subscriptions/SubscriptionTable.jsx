"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function SubscriptionTable({ subscriptions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Month</th>
            <th className="text-left p-3">Year</th>
            <th className="text-left p-3">Amount</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Payment Mode</th>
            <th className="text-left p-3">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="border-t">
              <td className="p-3">{sub.month}</td>
              <td className="p-3">{sub.year}</td>
              <td className="p-3">₹{sub.amount}</td>
              <td className="p-3">
                <Badge
                  variant={sub.status === "Paid" ? "default" : "destructive"}
                >
                  {sub.status}
                </Badge>
              </td>
              <td className="p-3">{sub.payment_mode || "-"}</td>
              <td className="p-3">
                {sub.status?.toLowerCase().trim() === "paid" ? (
                  <Button
                    size="sm"
                    onClick={() => window.location.href = `/user/subscriptions/${sub.year}-${String(sub.month).padStart(2, '0')}`}
                  >
                    View Details
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/pay/${sub.id}`}
                  >
                    Pay Now
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}