"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StatsCards() {
  const [stats, setStats] = useState([])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await axios.get(
        "http://localhost:5000/api/v1/admin/payments",
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      )

      const flatsRes = await axios.get(
        "http://localhost:5000/api/v1/flats?limit=1000",
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      )

      const totalFlats = flatsRes.data.total || 0

      const payments = res.data.payments || []

      let totalCollected = 0
      let pendingAmount = 0
      let monthlyCollection = 0

      const flatsSet = new Set()

      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      payments.forEach(p => {
        const amt = parseFloat(p.amount) || 0

        // Unique flats
        if (p.flat_number) {
          flatsSet.add(p.flat_number)
        }

        // Total collected (only success)
        if (p.status?.toLowerCase() === "success") {
          totalCollected += amt
        }

        // Pending payments
        if (p.status?.toLowerCase() === "pending") {
          pendingAmount += amt
        }

        // Monthly collection
        const date = new Date(p.payment_date)
        if (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear &&
          p.status?.toLowerCase() === "success"
        ) {
          monthlyCollection += amt
        }
      })

      const formattedStats = [
        { title: "Total Flats", value: totalFlats },
        {
          title: "Total Money Collected",
          value: `₹${totalCollected.toLocaleString("en-IN")}`
        },
        {
          title: "Pending Payments",
          value: `₹${pendingAmount.toLocaleString("en-IN")}`
        },
        {
          title: "Monthly Collection",
          value: `₹${monthlyCollection.toLocaleString("en-IN")}`
        }
      ]

      setStats(formattedStats)

    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">
              {stat.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}