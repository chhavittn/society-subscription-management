"use client"

import { useState } from "react"
import MonthlyRecordsTable from "./MonthlyRecordsTable"
import MonthSelector from "./MonthSelector"

export default function MonthlyRecordsPage() {
  const [month, setMonth] = useState("")

  return (
    <div className="admin-page">
      <h1 className="admin-title">
        Monthly Subscription Records
      </h1>

      <div className="admin-surface">
        <MonthSelector value={month} onChange={setMonth} />
      </div>

      {month && (
        <div className="admin-surface">
          <MonthlyRecordsTable selectedMonth={month} />
        </div>
      )}

    </div>
  )
}
