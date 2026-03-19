"use client" 
import ProtectedRoute from "../../components/ProtectedRoute"

import StatsCards from "./StatsCards"
import RevenueChart from "./RevenueChart"

export default function Dashboard() {

  return (

    <ProtectedRoute>

      <div>
        <h1 className="text-3xl font-bold mt-6">
          Society Financial Overview
        </h1>

        <StatsCards />
        <RevenueChart />

      </div>

    </ProtectedRoute>

  )
}