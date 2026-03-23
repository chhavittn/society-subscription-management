"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SubscriptionTable({ subscriptions }) {
  const router = useRouter()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

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
          {subscriptions.map((sub) => {
            const isCurrent =
              sub.month === currentMonth && sub.year === currentYear
            return (
              <tr
                key={sub.id}
                className={`border-t ${isCurrent ? "bg-yellow-50 font-semibold" : ""}`}
              >
                <td className="p-3">
                  {sub.month}
                  {isCurrent && (
                    <span className="ml-2 text-xs text-blue-600">(Current)</span>
                  )}
                </td>
                <td className="p-3">{sub.year}</td>
                <td className="p-3">₹{Number(sub.amount).toFixed(2)}</td>
                <td className="p-3">
                  <Badge
                    variant={sub.status?.toLowerCase() === "paid" ? "default" : "destructive"}
                  >
                    {sub.status}
                  </Badge>
                </td>
                <td className="p-3">{sub.payment_mode || "-"}</td>
                <td className="p-3">
                  {sub.status?.toLowerCase() === "paid" ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/user/subscriptions/${sub.year}-${String(sub.month).padStart(
                            2,
                            "0"
                          )}`
                        )
                      }
                    >
                      View Details
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/user/payments?month=${sub.month}&year=${sub.year}`
                        )
                      }
                    >
                      Pay Now
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
