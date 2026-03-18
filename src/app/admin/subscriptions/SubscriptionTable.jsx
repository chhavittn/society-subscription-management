"use client"

import axios from "axios"
import EditSubscriptionModal from "./EditSubscriptionModal"
import SubscriptionDetailsModal from "./SubscriptionDetailsModal"
import { Button } from "@/components/ui/button"

export default function SubscriptionTable({
  plans = [],
  fetchPlans,
  onPlanUpdated,
}) {

  // Delete a plan
  const deletePlan = async (id) => {
    if (!confirm("Delete this plan?")) return

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/plan/${id}`,
        { withCredentials: true }
      )
      await fetchPlans?.() // Refresh table after deletion
    } catch (error) {
      console.log(error)
      alert("Delete failed")
    }
  }

  return (
    <div className="space-y-4">
      {/* Plans Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Plan Name</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, index) => (
              <tr key={plan.id || index} className="border-t">
                <td className="p-3">{plan.plan_name}</td>
                <td className="p-3">₹{plan.amount}</td>
                <td className="p-3">{plan.duration_months} months</td>
                <td className="p-3 flex gap-2">
                  <SubscriptionDetailsModal plan={plan} />
                  <EditSubscriptionModal
                    plan={plan}
                    onUpdated={(p) => {
                      // #region agent log
                      fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'post-fix',hypothesisId:'H1',location:'src/app/admin/subscriptions/SubscriptionTable.jsx:onUpdated',message:'EditSubscriptionModal onUpdated (table)',data:{updatedPlanId:p?.id??null,updatedPlanName:p?.plan_name??null},timestamp:Date.now()})}).catch(()=>{});
                      // #endregion
                      onPlanUpdated?.(p, true)
                    }}
                  />
                  <Button size="sm" variant="destructive" onClick={() => deletePlan(plan.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}