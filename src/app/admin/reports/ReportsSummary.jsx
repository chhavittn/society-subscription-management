"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsSummary() {
  const [stats, setStats] = useState([])

  async function fetchData() {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.log("❌ No token found, please login first")
        return
      }

      const flatsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/flats?limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )
      const flats = flatsRes.data.flats || []
      const allPayments = []
      let page = 1
      const pageSize = 500
      while (true) {
        const paymentsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/payments?page=${page}&limit=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        )
        const batch = paymentsRes.data.payments || []
        allPayments.push(...batch)
        if (batch.length < pageSize) break
        page += 1
      }

      const isOccupied = (flat) =>
        Boolean(flat.user_name?.trim()) && Boolean(flat.user_email?.trim())

      const occupiedFlats = flats.filter(isOccupied).length
      const vacantFlats = flats.length - occupiedFlats

      let totalCollection = 0
      let pendingAmount = 0

      allPayments.forEach(p => {
        const status = (p.status || "").toLowerCase()
        if (status === "paid" || status === "success") totalCollection += Number(p.amount)
        else pendingAmount += Number(p.amount)
      })

      const expectedRevenue = allPayments.reduce((acc, p) => acc + Number(p.amount), 0)
      const collectionEfficiency = expectedRevenue > 0
        ? Math.round((totalCollection / expectedRevenue) * 100)
        : 0

      const formatCurrency = num => `₹${num.toLocaleString("en-IN")}`

      setStats([
        { title: "Total Flats", value: flats.length.toString() },
        { title: "Occupied Flats", value: occupiedFlats.toString() },
        { title: "Vacant Flats", value: vacantFlats.toString() },
        { title: "Total Collection", value: formatCurrency(totalCollection) },
        { title: "Expected Revenue", value: formatCurrency(expectedRevenue) },
        { title: "Collection Efficiency", value: `${collectionEfficiency}%` },
        { title: "Pending Amount", value: formatCurrency(pendingAmount) },
      ])

    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  useEffect(() => {
    fetchData()
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
