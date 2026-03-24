"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const COLORS = ["#0984e3", "#00cec9", "#6c5ce7", "#e84393", "#fdcb6e"]

export function PaymentModeChart() {
  const [data, setData] = useState([])

  async function fetchPaymentModes() {
    try {
      const token = localStorage.getItem("token")
      if (!token) return;

      const allPayments = []
      let page = 1
      const pageSize = 500
      while (true) {
        const res = await axios.get(
          `http://localhost:5000/api/v1/admin/payments?page=${page}&limit=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        )

        const batch = res.data.payments || []
        allPayments.push(...batch)
        if (batch.length < pageSize) break
        page += 1
      }

      const modeMap = {}
      allPayments.forEach(p => {
        const status = (p.status || "").toLowerCase()
        if (!(status === "paid" || status === "success")) return

        let mode = (p.payment_mode || "Unknown").trim()
        if (!mode) mode = "Unknown"
        mode = mode.toLowerCase()

        if (!modeMap[mode]) modeMap[mode] = 0
        modeMap[mode] += parseFloat(p.amount) || 0
      })

      const chartData = Object.entries(modeMap).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value
      }))

      setData(chartData)
    } catch (error) {
      console.error("Error fetching payment modes:", error)
    }
  }

  useEffect(() => {
    fetchPaymentModes()
  }, [])

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="text-[#2d3436]">
          Payment Mode Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={{ fill: "#636e72", fontSize: 12 }}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(9, 132, 227, 0.15)",
                  borderRadius: "10px"
                }}
                formatter={(value) =>
                  `₹${value.toLocaleString("en-IN")}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
