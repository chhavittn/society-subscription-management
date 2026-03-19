"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function RevenueChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchRevenue()
  }, [])

  const fetchRevenue = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await axios.get(
        "http://localhost:5000/api/v1/admin/payments",
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      )

      const payments = res.data.payments || []

      // ---- Aggregate by month ----
      const revenueMap = {}

      payments.forEach(p => {
        const amt = parseFloat(p.amount) || 0
        const date = new Date(p.payment_date)

        const monthIndex = date.getMonth() // 0-11

        if (!revenueMap[monthIndex]) {
          revenueMap[monthIndex] = 0
        }

        revenueMap[monthIndex] += amt
      })

      // ---- Convert to chart format ----
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ]

      const chartData = Object.keys(revenueMap)
        .sort((a, b) => a - b)
        .map(key => ({
          month: months[key],
          revenue: revenueMap[key]
        }))

      setData(chartData)

    } catch (error) {
      console.error("Error fetching revenue:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Collection</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>

              <XAxis dataKey="month" />
              <YAxis />

              <Tooltip formatter={(val) => `₹${val}`} />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
              />

            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}