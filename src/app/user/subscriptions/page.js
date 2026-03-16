"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import SubscriptionTable from "./SubscriptionTable"

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/v1/my-subscriptions",
          { withCredentials: true }
        )

        if (data.success) {
          setSubscriptions(data.subscriptions)
        }
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Monthly Subscription Status
      </h1>

      <Card>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading subscriptions...</p>
          ) : subscriptions.length === 0 ? (
            <p className="text-gray-500">No subscriptions found.</p>
          ) : (
            <SubscriptionTable subscriptions={subscriptions} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}