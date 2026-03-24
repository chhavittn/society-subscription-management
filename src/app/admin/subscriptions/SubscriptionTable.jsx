"use client"

import EditSubscriptionModal from "./EditSubscriptionModal"

export default function SubscriptionTable({
  plans = [],
  fetchPlans,
  onPlanUpdated,
}) {
  return (
    <div className="space-y-4">
      <div className="admin-table-wrap">
        <table className="w-full text-sm">
          <thead className="admin-table-head">
            <tr className="admin-table-head-row">
              <th className="p-3 text-left">Flat Type</th>
              <th className="p-3 text-left">Monthly Rate</th>
              <th className="p-3 text-left">Effective From</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {plans.filter(Boolean).map((plan, index) => (
              <tr
                key={plan.id || index}
                className={`border-t border-[#dfe6e9] ${
                  index % 2 === 0 ? "admin-row-even" : "admin-row-odd"
                } admin-row-hover transition`}
              >
                <td className="p-3 font-medium text-[#2d3436]">
                  {plan.flat_type || plan.plan_name || "-"}
                </td>

                <td className="p-3 text-[#2d3436]">
                  ₹{plan.amount || plan.plan_amount || "-"} /month
                </td>

                <td className="p-3 text-[#636e72]">
                  {plan.effective_from
                    ? new Date(plan.effective_from).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3">
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
