"use client"

import Link from "next/link"

export default function UserSidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-5">

      <h2 className="text-xl font-bold mb-6">User Panel</h2>

      <ul className="space-y-4">
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/payments">My Payments</Link></li>
        <li><Link href="/profile">Profile</Link></li>
      </ul>

    </div>
  )
}