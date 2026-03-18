"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MonthlyRecordsTable({ month }) {

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchRecords = useCallback(async () => {
    if (!month) return

    try {
      setLoading(true)

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${month}`,
        { withCredentials: true }
      )

      console.log("API RESPONSE:", data)

      // ✅ correct handling
      setRecords(data.subscriptions || [])

    } catch (error) {
      console.log("Error fetching records:", error)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const markAsPaid = async (id) => {
    try {
      const record = records.find(r => r.id === id)
      if (!record) return

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

      setRecords(prev =>
        prev.map(r =>
          r.id === id ? { ...r, status: "paid" } : r
        )
      )

    } catch (error) {
      console.log(error)
    }
  }

  const getStatusBadge = (status) => {
    const s = status?.trim().toLowerCase()

    if (s === "paid") return <Badge>Paid</Badge>
    if (s === "overdue") return <Badge variant="destructive">Overdue</Badge>
    return <Badge variant="secondary">Pending</Badge>
  }

  return (
    <div className="space-y-6">

      {loading && <p>Loading records...</p>}

      {!loading && month && records.length === 0 && (
        <p>No records found for this month.</p>
      )}

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
                    {getStatusBadge(record.status)}
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