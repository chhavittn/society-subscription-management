"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsSummary() {
  const [stats, setStats] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch payments, flats, and subscriptions
      const [paymentsRes, flatsRes, subscriptionsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/v1/admin/payments?limit=1000", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get("http://localhost:5000/api/v1/flats?limit=1000", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get("http://localhost:5000/api/v1/admin/subscriptions?limit=1000", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
      ])

      const payments = paymentsRes.data.payments
      const flats = flatsRes.data.flats
      const subscriptions = subscriptionsRes.data.subscriptions

      // Map subscription_id → flat_id
      const subscriptionToFlat = {}
      subscriptions.forEach(sub => {
        subscriptionToFlat[sub.id] = sub.flat_id
      })

      // Metrics
      let totalCollection = 0
      let pendingAmount = 0
      const paidFlatsSet = new Set()
      const overduePayments = []
      const today = new Date()

      payments.forEach(p => {
        const flatId = subscriptionToFlat[p.subscription_id]
        const paymentDate = new Date(p.payment_date)

        if (p.status === "success") {
          totalCollection += Number(p.amount)
          paidFlatsSet.add(flatId)
        } else {
          pendingAmount += Number(p.amount)
          if (paymentDate < today) overduePayments.push({ ...p, flatId })
        }
      })

      const expectedRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0)
      const collectionEfficiency = expectedRevenue > 0
        ? Math.round((totalCollection / expectedRevenue) * 100)
        : 0

      // Defaulters = flats with overdue payments >= 1 month
      const defaulters = new Set()
      overduePayments.forEach(p => {
        const paymentDate = new Date(p.payment_date)
        const diffMonths = (today.getFullYear() - paymentDate.getFullYear()) * 12 +
          (today.getMonth() - paymentDate.getMonth())
        if (diffMonths >= 1) defaulters.add(p.flatId)
      })

      // Occupied / Vacant flats
      const totalFlats = flats.length
      const occupiedFlats = flats.filter(f => f.is_active).length
      const vacantFlats = totalFlats - occupiedFlats

      // Helper
      const formatCurrency = (num) => `₹${num.toLocaleString("en-IN")}`

      setStats([
        { title: "Total Collection", value: formatCurrency(totalCollection) },
        { title: "Expected Revenue", value: formatCurrency(expectedRevenue) },
        { title: "Collection Efficiency", value: `${collectionEfficiency}%` },
        { title: "Pending Amount", value: formatCurrency(pendingAmount) },
        { title: "Overdue Payments", value: overduePayments.length.toString() },
        { title: "Defaulters", value: defaulters.size.toString() },
        { title: "Occupied Flats", value: occupiedFlats.toString() },
        { title: "Vacant Flats", value: vacantFlats.toString() },
      ])

    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  return (
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
  )
}