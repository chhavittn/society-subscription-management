"use client"

import StatsCards from "./StatsCards"
import RevenueChart from "./RevenueChart"

export default function Dashboard() {
  return (

    <div className="admin-page">
      <div>
        <h1 className="admin-title mb-2">
          Society Financial Overview
        </h1>
        <p className="admin-subtitle">
          Track collections, pending dues, and revenue performance from admin view.
        </p>
      </div>
      <div className="admin-surface space-y-6">
        <StatsCards />
        <RevenueChart />
      </div>
    </div>
  )
}
