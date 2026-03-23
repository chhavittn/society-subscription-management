"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CurrentSubscription() {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v1/my-subscriptions", {
          withCredentials: true
        })
        if (res.data.success) {
          setSubscription(res.data.pending)
        } else {
          setSubscription(null)
        }
      } catch (err) {
        console.error(err)
        setError("Failed to fetch subscription")
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!subscription) return <p>No subscription found</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Month Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <p>Status</p>
          <Badge variant={subscription.status === "paid" ? "default" : "destructive"}>
            {subscription.status || "Pending"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <p>Pending Amount</p>
          <p className="font-bold text-lg">₹{subscription.status === "paid" ? 0 : subscription.amount}</p>
        </div>
      </CardContent>
    </Card>
  )
}