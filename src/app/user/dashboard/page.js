"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Dashboard() {

  const router = useRouter()

  const [subscription, setSubscription] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const currentDate = new Date()
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

  useEffect(() => {

    const fetchData = async () => {

      try {

        const [subRes, payRes] = await Promise.all([

          axios.get(
            `http://localhost:5000/api/v1/my-subscriptions/${currentMonth}`,
            { withCredentials: true }
          ),

          axios.get(
            `http://localhost:5000/api/v1/my-payments`,
            { withCredentials: true }
          )

        ])

        if (subRes.data.success) {
          setSubscription(subRes.data.subscription)
        }

        if (payRes.data.success) {
          setPayments(payRes.data.payments)
        }

      } catch (err) {

        console.log(err)

      } finally {

        setLoading(false)

      }

    }

    fetchData()

  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )
  }

  const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount), 0)

  const pendingAmount =
    subscription && subscription.status !== "paid"
      ? subscription.amount
      : 0

  const progress =
    subscription?.status === "paid"
      ? 100
      : 0

  return (

    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold">
        Resident Dashboard
      </h1>

      {/* Stats Cards */}

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Flat Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">

            <div className="flex justify-between">
              <span className="text-gray-500">Flat Number</span>
              <span className="font-medium">{subscription?.flat_number}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Block</span>
              <span className="font-medium">{subscription?.block}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Owner</span>
              <span className="font-medium">{subscription?.user_name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Address</span>
              <span className="font-medium text-right">
                {subscription?.block} - {subscription?.flat_number}
              </span>
            </div>

          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {subscription?.plan_name || "Maintenance"}
            </p>
            <Badge>
              {subscription?.status || "Not Generated"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₹{pendingAmount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₹{totalPaid}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments Made</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {payments.length}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Payment Progress */}

      <Card>

        <CardHeader>
          <CardTitle>Maintenance Payment Progress</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <Progress value={progress} />

          <div className="flex justify-between text-sm text-gray-500">

            <span>
              Month: {currentMonth}
            </span>

            <span>
              {subscription?.status === "paid" ? "Paid" : "Pending"}
            </span>

          </div>

        </CardContent>

      </Card>

      {/* Charges Breakdown */}

      {subscription?.breakdown && (

        <Card>

          <CardHeader>
            <CardTitle>Charges Breakdown</CardTitle>
          </CardHeader>

          <CardContent>

            <table className="w-full">

              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="text-left py-2">Charge</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>

              <tbody>

                {subscription.breakdown.map((item, index) => (

                  <tr key={index} className="border-b">

                    <td className="py-2">
                      {item.name}
                    </td>

                    <td className="py-2 text-right">
                      ₹{Number(item.amount).toFixed(2)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </CardContent>

        </Card>

      )}

      {/* Recent Payments */}

      <Card>

        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>

        <CardContent>

          <table className="w-full">

            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Mode</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>

            <tbody>

              {payments.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-b">

                  <td className="py-2">
                    ₹{p.amount}
                  </td>

                  <td className="py-2">
                    {p.payment_mode}
                  </td>

                  <td className="py-2">
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </CardContent>

      </Card>

      {/* Quick Actions */}

      <div className="flex gap-4">

        <Button
          onClick={() => router.push("/user/subscriptions")}
        >
          View Subscriptions
        </Button>

        <Button
          onClick={() => router.push("/user/payments")}
        >
          Payment History
        </Button>

        {pendingAmount > 0 && (

          <Button
            onClick={() => router.push("/pay")}
          >
            Pay Now
          </Button>

        )}

      </div>

    </div>

  )

}