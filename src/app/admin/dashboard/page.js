"use client"
// want it simple as per the society subscription management, just add tailwind css...   
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