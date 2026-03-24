"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MonthlyRecordsTable() {
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  const [month, setMonth] = useState(currentMonth)

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchRecords = useCallback(async () => {
    if (!month) return

    try {
      setLoading(true)
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${month}`,
        { withCredentials: true }
      )

      const mapped = (data.subscriptions || []).map((r) => ({
        ...r,
        subscription_id: r.subscription_id || r.id || 0,
      }))
      setRecords(mapped)
    } catch (error) {
      console.error("Error fetching records:", error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const markAsPaid = async (recordId) => {
    const record = records.find(r => r.subscription_id === recordId)
    if (!record) return

    try {
      const [year, monthNum] = month.split("-")

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/mark-paid`,
        {
          subscription_id: record.subscription_id || undefined,
          flat_id: record.flat_id,
          plan_id: record.plan_id || 1,
          amount: record.amount || 2200,
          due_date: record.due_date || `${year}-${monthNum}-10`,
          month: Number(monthNum),
          year: Number(year),
        },
        { withCredentials: true }
      )
      const updatedSubId = res.data?.subscription?.id || record.subscription_id

      setRecords(prev =>
        prev.map(r => r.flat_id === record.flat_id ? { ...r, status: "paid", subscription_id: updatedSubId } : r)
      )
    } catch (error) {
      console.error("Failed to mark paid:", error)
    }
  }
  const getStatusBadge = (status) => {
    const s = status?.trim().toLowerCase()
    if (s === "paid") return <Badge className="admin-badge-paid">Paid</Badge>
    if (s === "overdue") return <Badge className="admin-badge-overdue">Overdue</Badge>
    return <Badge className="admin-badge-pending">Pending</Badge>
  }

  return (
    <div className="space-y-6">
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="admin-select-trigger w-60">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent className="admin-select-content">
          {Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, "0")
            return (
              <SelectItem key={m} value={`${today.getFullYear()}-${m}`}>
                {new Date(today.getFullYear(), i).toLocaleString("default", { month: "long" })} {today.getFullYear()}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {loading && <p className="text-[#2d3436]">Loading records...</p>}

      {!loading && records.length === 0 && (
        <p className="text-[#636e72]">No records found for this month.</p>
      )}

      {!loading && records.length > 0 && (
        <div className="admin-table-wrap">
          <table className="w-full">
            <thead className="admin-table-head">
              <tr className="admin-table-head-row">
              <th className="p-3 text-left">Flat</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => {
              const status = record.status?.trim().toLowerCase()
              return (
                <tr
                  key={record.flat_id}
                  className={`border-t border-[#dfe6e9] ${
                    index % 2 === 0 ? "admin-row-even" : "admin-row-odd"
                  } admin-row-hover`}
                >
                  <td className="p-3 text-[#2d3436]">{record.flat_number} ({record.block})</td>
                  <td className="p-3 text-[#636e72]">{record.user_name}</td>
                  <td className="p-3">{getStatusBadge(record.status)}</td>
                  <td className="p-3">
                    {["pending", "overdue"].includes(status) && (
                      <Button
                        size="sm"
                        className="admin-btn-primary"
                        onClick={() => markAsPaid(record.subscription_id)}
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
        </div>
      )}
    </div>
  )
}
