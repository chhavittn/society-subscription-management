"use client"

import Link from "next/link"

export default function AdminSidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">

      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

      <ul className="space-y-4">
        <li><Link href="/admin/dashboard">Dashboard</Link></li>
        <li><Link href="/admin/members">Manage Members</Link></li>
        <li><Link href="/admin/payments">Payments</Link></li>
        <li><Link href="/admin/reports">Reports</Link></li>
      </ul>

    </div>
  )
}