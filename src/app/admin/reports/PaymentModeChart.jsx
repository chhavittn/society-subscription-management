"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

// -------- Payment Mode Pie Chart --------
export function PaymentModeChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchPaymentModes()
  }, [])

  const fetchPaymentModes = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:5000/api/v1/admin/payments", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })

      const payments = res.data.payments || []

      // Aggregate by payment_mode
      const modeMap = {}
      payments.forEach(p => {
        const mode = p.payment_mode || "Unknown"
        const amt = parseFloat(p.amount) || 0
        if (!modeMap[mode]) modeMap[mode] = 0
        modeMap[mode] += amt
      })

      // Convert to chart-friendly array
      const chartData = Object.keys(modeMap).map(key => ({
        name: key,
        value: modeMap[key]
      }))

      setData(chartData)
    } catch (error) {
      console.error("Error fetching payment modes:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Mode Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// -------- Revenue Over Time Line Chart --------
export function RevenueOverTimeChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchRevenueOverTime()
  }, [])

  const fetchRevenueOverTime = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:5000/api/v1/admin/payments", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })

      const payments = res.data.payments || []

      // Aggregate revenue by month (yyyy-mm)
      const revenueMap = {}
      payments.forEach(p => {
        const date = new Date(p.payment_date)
        const month = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`
        const amt = parseFloat(p.amount) || 0
        if (!revenueMap[month]) revenueMap[month] = 0
        revenueMap[month] += amt
      })

      // Convert to chart array
      const chartData = Object.keys(revenueMap)
        .sort()
        .map(key => ({ month: key, revenue: revenueMap[key] }))

      setData(chartData)
    } catch (error) {
      console.error("Error fetching revenue over time:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}