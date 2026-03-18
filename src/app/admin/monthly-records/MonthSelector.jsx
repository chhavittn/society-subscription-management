"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MonthlyRecordsTable() {

  const [month, setMonth] = useState("")
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  // ✅ Fetch records based on selected month
  const fetchRecords = useCallback(async () => {

    if (!month) {
      console.log("❌ No month selected")
      return
    }

    console.log("✅ Selected month:", month)

    try {
      setLoading(true)

      console.log("📡 Calling API:",
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${month}`
      )

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${month}`,
        { withCredentials: true }
      )

      console.log("✅ FULL RESPONSE:", response)
      console.log("✅ DATA:", response.data)
      console.log("✅ SUBSCRIPTIONS:", response.data?.subscriptions)

      if (!response.data) {
        console.log("❌ No data returned from API")
        setRecords([])
        return
      }

      if (!Array.isArray(response.data.subscriptions)) {
        console.log("❌ subscriptions is not array:", response.data.subscriptions)
        setRecords([])
        return
      }

      console.log("🎯 Setting records:", response.data.subscriptions.length)

      setRecords(response.data.subscriptions)

    } catch (error) {
      console.log("❌ API ERROR:", error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }, [month])

  // ✅ useEffect FIXED (stable dependency)
  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // ✅ Mark as Paid
  const markAsPaid = async (id) => {
    console.log("👉 Mark as paid clicked for ID:", id)

    const record = records.find(r => r.id === id)

    console.log("📦 Found record:", record)

    if (!record) {
      console.log("❌ Record not found")
      return
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscription/${id}`,
        {
          plan_id: record.plan_id,
          amount: record.amount,
          status: "paid",
          due_date: record.due_date
        },
        { withCredentials: true }
      )

      console.log("✅ Updated successfully")

      setRecords(prev =>
        prev.map(r =>
          r.id === id ? { ...r, status: "paid" } : r
        )
      )

    } catch (error) {
      console.log("❌ Update failed:", error)
    }
  }

  // ✅ Status badge helper
  const renderStatus = (statusRaw) => {
    const status = statusRaw?.trim().toLowerCase()

    if (status === "paid") return <Badge>Paid</Badge>
    if (status === "overdue") return <Badge variant="destructive">Overdue</Badge>
    return <Badge variant="secondary">Pending</Badge>
  }

  return (
    <div className="space-y-6">

      {/* 🔽 Month Selector */}
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="w-60">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="2026-01">January 2026</SelectItem>
          <SelectItem value="2026-02">February 2026</SelectItem>
          <SelectItem value="2026-03">March 2026</SelectItem>
          <SelectItem value="2026-04">April 2026</SelectItem>
          <SelectItem value="2026-05">May 2026</SelectItem>
          <SelectItem value="2026-06">June 2026</SelectItem>
          <SelectItem value="2026-07">July 2026</SelectItem>
          <SelectItem value="2026-08">August 2026</SelectItem>
          <SelectItem value="2026-09">September 2026</SelectItem>
          <SelectItem value="2026-10">October 2026</SelectItem>
          <SelectItem value="2026-11">November 2026</SelectItem>
          <SelectItem value="2026-12">December 2026</SelectItem>
        </SelectContent>
      </Select>

      {/* 🔄 Loading */}
      {loading && <p>Loading records...</p>}

      {/* 📭 No Data */}
      {!loading && month && records.length === 0 && (
        <p>No records found for this month.</p>
      )}

      {/* 📊 Table */}
      {!loading && records.length > 0 && (
        <table className="w-full border rounded">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Flat</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {records.map(record => {
              const status = record.status?.trim().toLowerCase()

              return (
                <tr key={record.id} className="border-t">

                  <td className="p-3">
                    {record.flat_number} ({record.block})
                  </td>

                  <td className="p-3">
                    {record.user_name}
                  </td>

                  <td className="p-3">
                    {renderStatus(record.status)}
                  </td>

                  <td className="p-3">

                    {["pending", "overdue"].includes(status) && (
                      <Button
                        size="sm"
                        onClick={() => markAsPaid(record.id)}
                      >
                        Mark Paid
                      </Button>
                    )}

                  </td>

                </tr>
              )
            })}
          </tbody>

        </table>
      )}

    </div>
  )
}