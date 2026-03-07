"use client"

import { useState } from "react"
import EditSubscriptionModal from "./EditSubscriptionModal"
import SubscriptionDetailsModal from "./SubscriptionDetailsModal"
import { Button } from "@/components/ui/button"

export default function SubscriptionTable() {

  const [plans,setPlans] = useState([
    {
      id:1,
      type:"1BHK",
      amount:1200,
      description:"Basic plan for 1BHK flats",
      maintenance:"Water, cleaning, security",
      parking:"1 slot",
      support:"Email Support"
    },
    {
      id:2,
      type:"2BHK",
      amount:1500,
      description:"Standard plan for 2BHK flats",
      maintenance:"Water, cleaning, security, lift",
      parking:"1 slot",
      support:"Priority Support"
    },
    {
      id:3,
      type:"3BHK",
      amount:1800,
      description:"Premium plan for 3BHK flats",
      maintenance:"All services included",
      parking:"2 slots",
      support:"24/7 Priority Support"
    }
  ])

  return (

    <div className="border rounded-lg overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>
            <th className="p-3 text-left">Flat Type</th>
            <th className="p-3 text-left">Monthly Amount</th>
            <th className="p-3 text-left">Actions</th>
          </tr>

        </thead>

        <tbody>

          {plans.map(plan => (

            <tr key={plan.id} className="border-t">

              <td className="p-3">{plan.type}</td>

              <td className="p-3">
                ₹{plan.amount}/month
              </td>

              <td className="p-3 flex gap-2">

                <SubscriptionDetailsModal plan={plan} />

                <EditSubscriptionModal plan={plan} />

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )
}