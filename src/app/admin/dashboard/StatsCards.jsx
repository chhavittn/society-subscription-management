"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StatsCards() {
  const [stats, setStats] = useState([])

  async function fetchStats() {
    try {
      const token = localStorage.getItem("token")

      const res = await axios.get(
        "http://localhost:5000/api/v1/admin/subscriptions/all",
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      )

      const subscriptions = res.data.subscriptions || []

      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      const flatsSet = new Set()
      let totalCollected = 0
      let pendingAmount = 0
      let monthlyCollection = 0

      subscriptions.forEach(sub => {
        if (sub.flat_number) flatsSet.add(sub.flat_number)

        if (sub.status?.toLowerCase() === "paid") {
          totalCollected += Number(sub.amount) || 0
        }

        if (sub.status?.toLowerCase() === "pending") {
          pendingAmount += Number(sub.amount) || 0
        }

        if (
          Number(sub.month) === currentMonth &&
          Number(sub.year) === currentYear &&
          sub.status?.toLowerCase() === "paid"
        ) {
          monthlyCollection += Number(sub.amount) || 0
        }
      })

      const formattedStats = [
        { title: "Total Flats", value: flatsSet.size },
        { title: "Total Money Collected", value: `₹${totalCollected.toLocaleString("en-IN")}` },
        { title: "Pending Payments", value: `₹${pendingAmount.toLocaleString("en-IN")}` },
        { title: "Monthly Collection", value: `₹${monthlyCollection.toLocaleString("en-IN")}` }
      ]

      setStats(formattedStats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="admin-card hover:scale-[1.02]"
        >
          <CardHeader>
            <CardTitle className="text-sm text-[#636e72]">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#2d3436]">
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
