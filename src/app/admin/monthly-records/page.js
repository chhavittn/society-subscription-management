"use client"

import { useState } from "react"
import MonthlyRecordsTable from "./MonthlyRecordsTable"
import MonthSelector from "./MonthSelector"

export default function MonthlyRecordsPage() {
  const [month, setMonth] = useState("")

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Monthly Subscription Records
      </h1>

      {/* ✅ ONLY ONE SELECT HERE */}
      <MonthSelector value={month} onChange={setMonth} />

    </div>
  )
}