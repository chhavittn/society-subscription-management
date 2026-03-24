"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SubscriptionTable({ subscriptions }) {
  const router = useRouter();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <div className="admin-table-wrap overflow-x-auto">
      <table className="w-full">
        <thead className="admin-table-head">
          <tr className="admin-table-head-row text-sm uppercase">
            <th className="p-3 text-left">Month</th>
            <th className="p-3 text-left">Year</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Payment Mode</th>
            <th className="p-3 text-left">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription, index) => {
            const isCurrent = subscription.month === currentMonth && subscription.year === currentYear;
            return (
              <tr
                key={subscription.id}
                className={`border-t border-[#dfe6e9] ${
                  index % 2 === 0 ? "admin-row-even" : "admin-row-odd"
                } admin-row-hover`}
              >
                <td className="p-3 text-[#2d3436]">
                  {subscription.month}
                  {isCurrent && <span className="ml-2 text-xs text-[#0984e3]">(Current)</span>}
                </td>
                <td className="p-3 text-[#2d3436]">{subscription.year}</td>
                <td className="p-3 font-semibold text-[#2d3436]">₹{Number(subscription.amount).toFixed(2)}</td>
                <td className="p-3">
                  <Badge className={subscription.status?.toLowerCase() === "paid" ? "admin-badge-paid" : "admin-badge-pending"}>
                    {subscription.status}
                  </Badge>
                </td>
                <td className="p-3 text-[#636e72]">{subscription.payment_mode || "-"}</td>
                <td className="p-3">
                  {subscription.status?.toLowerCase() === "paid" ? (
                    <Button
                      size="sm"
                      className="admin-btn-secondary rounded-xl"
                      onClick={() =>
                        router.push(`/user/subscriptions/${subscription.year}-${String(subscription.month).padStart(2, "0")}`)
                      }
                    >
                      View Details
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="admin-btn-ghost rounded-xl"
                      onClick={() =>
                        router.push(`/user/payments?month=${subscription.month}&year=${subscription.year}`)
                      }
                    >
                      Pay Now
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
