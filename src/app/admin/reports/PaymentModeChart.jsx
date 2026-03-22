"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export function PaymentModeChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchPaymentModes()
  }, [])

  const fetchPaymentModes = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return console.log("❌ No token found")

      const res = await axios.get("http://localhost:5000/api/v1/admin/payments", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })

      const payments = res.data.payments || []

      // ✅ Defensive normalization
      const modeMap = {}
      payments.forEach(p => {
        let mode = (p.payment_mode || "Unknown").trim() // remove spaces
        if (!mode) mode = "Unknown"
        mode = mode.toLowerCase() // unify casing

        if (!modeMap[mode]) modeMap[mode] = 0
        modeMap[mode] += parseFloat(p.amount) || 0
      })

      // Convert to chart-friendly array and capitalize names
      const chartData = Object.entries(modeMap).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalized: Cash, UPI
        value
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