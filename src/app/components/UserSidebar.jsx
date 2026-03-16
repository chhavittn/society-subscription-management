"use client"

import Link from "next/link"
export default function UserSidebar() {

  const month = new Date().toLocaleString("default", { month: "long" }).toLowerCase()

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-5">
      <h2 className="text-xl font-bold mb-6">User Panel</h2>
      <ul className="space-y-4">
        <li><Link href="/user/dashboard">Dashboard</Link></li>
        <li>
          <Link href="/user/subscriptions">Subscriptions</Link>
        </li>
        <li>
          <Link href={`/user/subscriptions/${month}`}>
            Monthly Subscription Details
          </Link>
        </li>
        <li><Link href="/user/payments">My Payments</Link></li>
        <li><Link href="/profile">Profile</Link></li>
      </ul>

    </div>
  )
}