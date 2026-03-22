"use client"

import { useEffect, useState } from "react"
import axios from "axios"

import SubscriptionTable from "./SubscriptionTable"

export default function SubscriptionsPage() {

  const [plans, setPlans] = useState([])
  const handlePlanUpdated = (updatedPlan) => {
    setPlans(prev =>
      prev.map(p => (p.id === updatedPlan.id ? updatedPlan : p))
    )
  }

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/plans`,
        { withCredentials: true }
      )

      setPlans(data.plans || [])
    } catch (error) {
      console.log("Error fetching plans:", error)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Subscription Plans
        </h1>
      </div>

      <p className="text-gray-500">
        Manage monthly maintenance charges based on flat types.
      </p>

      <SubscriptionTable
        plans={plans}
        fetchPlans={fetchPlans}
        onPlanUpdated={(updatedPlan) => handlePlanUpdated(updatedPlan)}
      />

    </div>
  )
}