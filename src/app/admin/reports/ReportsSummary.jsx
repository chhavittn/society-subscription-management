"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsSummary() {
  const [stats, setStats] = useState([])
  const [flats, setFlats] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
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
      const paymentsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/payments?limit=1000`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      )

      const flats = flatsRes.data.flats || []
      const payments = paymentsRes.data.payments || []

      const occupiedFlats = flats.filter(f => f.user_id !== null && f.user_id !== undefined).length
      const vacantFlats = flats.filter(f => f.user_id === null || f.user_id === undefined).length

      // Financial metrics
      let totalCollection = 0
      let pendingAmount = 0

      payments.forEach(p => {
        if (p.status?.toLowerCase() === "success") totalCollection += Number(p.amount)
        else pendingAmount += Number(p.amount)
      })

      const expectedRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0)
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

  // Vacant flats list
  const vacantFlatList = flats.filter(f => !f.user_id)

  return (
    <div className="space-y-6">

      {/* --- Stats Cards --- */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}