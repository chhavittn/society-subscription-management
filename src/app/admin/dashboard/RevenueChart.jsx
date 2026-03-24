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

  async function fetchRevenue() {
    try {
      const token = localStorage.getItem("token")

      const pageSize = 100
      let page = 1
      let allPayments = []

      while (true) {
        const res = await axios.get(
          `http://localhost:5000/api/v1/admin/payments?page=${page}&limit=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        )

        const batch = res.data.payments || []
        allPayments = allPayments.concat(batch)

        if (batch.length < pageSize) break
        page += 1
      }

      const revenueMap = {}

      allPayments.forEach(p => {
        const amt = parseFloat(p.amount) || 0
        const date = new Date(p.payment_date)
        if (Number.isNaN(date.getTime())) return

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const key = `${year}-${month}`

        if (!revenueMap[key]) {
          revenueMap[key] = 0
        }

        revenueMap[key] += amt
      })

      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ]

      const chartData = Object.keys(revenueMap)
        .sort()
        .map(key => ({
          month: `${months[Number(key.split("-")[1]) - 1]} ${key.slice(2, 4)}`,
          revenue: revenueMap[key]
        }))

      setData(chartData)

    } catch (error) {
      console.error("Error fetching revenue:", error)
    }
  }

  useEffect(() => {
    fetchRevenue()
  }, [])

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="text-[#2d3436]">
          Monthly Collection
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>

              <XAxis dataKey="month" tick={{ fill: "#636e72", fontSize: 12 }} />
              <YAxis tick={{ fill: "#636e72", fontSize: 12 }} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(9, 132, 227, 0.15)",
                  borderRadius: "8px"
                }}
                formatter={(val) => `₹${val}`}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0984e3"
                strokeWidth={3}
                dot={{ r: 4, fill: "#00cec9" }}
                activeDot={{ r: 6, fill: "#6c5ce7" }}
              />

            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
