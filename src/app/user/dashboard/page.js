"use client"
import ProtectedRoute from "../../components/ProtectedRoute"
import SubscriptionStatus from "./SubscriptionStatus"
import PaymentHistory from "./PaymentHistory"
import Notifications from "./Notifications"

export default function Dashboard() {
  return (

    <ProtectedRoute>

      <div>

        <h1>Hello USER Dashboard</h1>

        <div className="space-y-8">

          <h1 className="text-3xl font-bold">
            Resident Dashboard
          </h1>

          <SubscriptionStatus />

          <div className="grid md:grid-cols-2 gap-6">
            <PaymentHistory />
            <Notifications />
          </div>

        </div>

      </div>

    </ProtectedRoute>

  )
}