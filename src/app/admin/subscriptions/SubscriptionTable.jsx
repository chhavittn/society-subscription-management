"use client"

import EditSubscriptionModal from "./EditSubscriptionModal"
import { Button } from "@/components/ui/button"

export default function SubscriptionTable({
  plans = [],
  fetchPlans,
  onPlanUpdated,
}) {
  return (
    <div className="space-y-4">

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Flat Type</th>
              <th className="p-3 text-left">Monthly Rate</th>
              <th className="p-3 text-left">Effective From</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {plans.filter(Boolean).map((plan, index) => (
              <tr key={plan.id || index} className="border-t">
                <td className="p-3 font-medium">
                  {plan.flat_type || plan.plan_name || "-"}
                </td>
                <td className="p-3">
                  ₹{plan.amount || plan.plan_amount || "-"} /month
                </td>
                <td className="p-3">
                  {plan.effective_from
                    ? new Date(plan.effective_from).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3 flex gap-2">
                  <EditSubscriptionModal
                    plan={plan}
                    onUpdated={(p) => onPlanUpdated?.(p, true)}
                  />
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  )
}