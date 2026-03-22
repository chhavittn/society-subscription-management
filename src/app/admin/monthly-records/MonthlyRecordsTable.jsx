// "use client"

// import { useState, useEffect, useCallback } from "react"
// import axios from "axios"

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from "@/components/ui/select"

// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"

// export default function MonthlyRecordsTable() {

//   const [month, setMonth] = useState("")
//   const [records, setRecords] = useState([])
//   const [loading, setLoading] = useState(false)

// const fetchRecords = useCallback(async () => {
//   if (!month) return

//   try {
//     setLoading(true)

//     const { data } = await axios.get(
//       `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${month}`, // 🔥 admin endpoint
//       { withCredentials: true }
//     )

//     // Ensure all records are shown, default pending if missing
//     const recordsWithDefaultStatus = (data.subscriptions || []).map(r => ({
//       ...r,
//       status: r.status || 'pending',
//     }))

//     setRecords(recordsWithDefaultStatus)
//   } catch (error) {
//     console.log("Error fetching records:", error)
//     setRecords([])
//   } finally {
//     setLoading(false)
//   }
// }, [month])

//   // ✅ useEffect FIXED (stable dependency)
//   useEffect(() => {
//     fetchRecords()
//   }, [fetchRecords])

//   // ✅ Mark as Paid
//   const markAsPaid = async (id) => {
//     console.log("👉 Mark as paid clicked for ID:", id)

//     const record = records.find(r => r.id === id)

//     console.log("📦 Found record:", record)

//     if (!record) {
//       console.log("❌ Record not found")
//       return
//     }

//     try {
//       await axios.put(
//         `${process.env.NEXT_PUBLIC_API_URL}/admin/subscription/${id}`,
//         {
//           plan_id: record.plan_id,
//           amount: record.amount,
//           status: "paid",
//           due_date: record.due_date
//         },
//         { withCredentials: true }
//       )

//       console.log("✅ Updated successfully")

//       setRecords(prev =>
//         prev.map(r =>
//           r.id === id ? { ...r, status: "paid" } : r
//         )
//       )

//     } catch (error) {
//       console.log("❌ Update failed:", error)
//     }
//   }

//   // ✅ Status badge helper
//   const renderStatus = (statusRaw) => {
//     const status = statusRaw?.trim().toLowerCase()

//     if (status === "paid") return <Badge>Paid</Badge>
//     if (status === "overdue") return <Badge variant="destructive">Overdue</Badge>
//     return <Badge variant="secondary">Pending</Badge>
//   }

//   return (
//     <div className="space-y-6">

//       {/* 🔽 Month Selector */}
//       <Select value={month} onValueChange={setMonth}>
//         <SelectTrigger className="w-60">
//           <SelectValue placeholder="Select Month" />
//         </SelectTrigger>

//         <SelectContent>
//           <SelectItem value="2026-01">January 2026</SelectItem>
//           <SelectItem value="2026-02">February 2026</SelectItem>
//           <SelectItem value="2026-03">March 2026</SelectItem>
//           <SelectItem value="2026-04">April 2026</SelectItem>
//           <SelectItem value="2026-05">May 2026</SelectItem>
//           <SelectItem value="2026-06">June 2026</SelectItem>
//           <SelectItem value="2026-07">July 2026</SelectItem>
//           <SelectItem value="2026-08">August 2026</SelectItem>
//           <SelectItem value="2026-09">September 2026</SelectItem>
//           <SelectItem value="2026-10">October 2026</SelectItem>
//           <SelectItem value="2026-11">November 2026</SelectItem>
//           <SelectItem value="2026-12">December 2026</SelectItem>
//         </SelectContent>
//       </Select>

//       {/* 🔄 Loading */}
//       {loading && <p>Loading records...</p>}

//       {/* 📭 No Data */}
//       {!loading && month && records.length === 0 && (
//         <p>No records found for this month.</p>
//       )}

//       {/* 📊 Table */}
//       {!loading && records.length > 0 && (
//         <table className="w-full border rounded">

//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3 text-left">Flat</th>
//               <th className="p-3 text-left">Owner</th>
//               <th className="p-3 text-left">Status</th>
//               <th className="p-3 text-left">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {records.map(record => {
//               const status = record.status?.trim().toLowerCase()

//               return (
//                 <tr key={record.id} className="border-t">

//                   <td className="p-3">
//                     {record.flat_number} ({record.block})
//                   </td>

//                   <td className="p-3">
//                     {record.user_name}
//                   </td>

//                   <td className="p-3">
//                     {renderStatus(record.status)}
//                   </td>

//                   <td className="p-3">

//                     {["pending", "overdue"].includes(status) && (
//                       <Button
//                         size="sm"
//                         onClick={() => markAsPaid(record.id)}
//                       >
//                         Mark Paid
//                       </Button>
//                     )}

//                   </td>

//                 </tr>
//               )
//             })}
//           </tbody>

//         </table>
//       )}

//     </div>
//   )
// }


"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MonthlyRecordsTable() {
  // ✅ Default to current month
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  const [month, setMonth] = useState(currentMonth)

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  // ✅ Fetch records for selected month
  const fetchRecords = useCallback(async () => {
    if (!month) return

    try {
      setLoading(true)
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${month}`,
        { withCredentials: true }
      )

      setRecords(data.subscriptions || [])
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

  // ✅ Mark subscription as paid
  const markAsPaid = async (recordId) => {
    const record = records.find(r => r.id === recordId)
    if (!record) return

    try {
      const [year, monthNum] = month.split("-")

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscription/${recordId}`,
        {
          plan_id: record.plan_id || 1,
          amount: record.amount || 0,
          due_date: record.due_date,
          month: Number(monthNum),
          year: Number(year),
          status: "paid",
        },
        { withCredentials: true }
      )

      // Update status in table
      setRecords(prev =>
        prev.map(r => r.id === recordId ? { ...r, status: "paid" } : r)
      )
    } catch (error) {
      console.error("Failed to mark paid:", error)
    }
  }

  // ✅ Status badge helper
  const getStatusBadge = (status) => {
    const s = status?.trim().toLowerCase()
    if (s === "paid") return <Badge>Paid</Badge>
    if (s === "overdue") return <Badge variant="destructive">Overdue</Badge>
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

      {/* 🔄 Loading */}
      {loading && <p>Loading records...</p>}

      {/* 📭 No Data */}
      {!loading && records.length === 0 && (
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
                  <td className="p-3">{record.flat_number} ({record.block})</td>
                  <td className="p-3">{record.user_name}</td>
                  <td className="p-3">{getStatusBadge(record.status)}</td>
                  <td className="p-3">
                    {["pending", "overdue"].includes(status) && (
                      <Button size="sm" onClick={() => markAsPaid(record.id)}>
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