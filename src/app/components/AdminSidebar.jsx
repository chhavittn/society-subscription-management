"use client"

import Link from "next/link"

export default function AdminSidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">
      <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
      <ul className="space-y-4">
        <li>
          <Link href="/admin/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/admin/flats" className="hover:text-gray-300">
            Manage Flats
          </Link>
        </li>
        <li className="space-y-2">
          <Link href="/admin/subscriptions" className="hover:text-gray-300 font-semibold">
            Subscriptions
          </Link>

          <ul className="ml-4 space-y-2">
            <li>
              <Link href="/admin/monthly-records" className="hover:text-gray-300">
                Monthly Records
              </Link>
            </li>
          </ul>
        </li>

        <li>
          <Link href="/admin/payment-entry" className="hover:text-gray-300">
            Payments
          </Link>
        </li>
        <li>
          <Link href="/admin/reports" className="hover:text-gray-300">
            Reports
          </Link>
        </li>
        <li className="space-y-2">
          <Link href="/admin/setting" className="hover:text-gray-300 font-semibold">
            Settings
          </Link>

          <ul className="ml-4 space-y-2">
            <li>
              <Link href="/profile" className="hover:text-gray-300">
                Admin Profile
              </Link>
            </li>
            <li>
              <Link href="/admin/notifications" className="hover:text-gray-300">
                Notifications
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  )
}