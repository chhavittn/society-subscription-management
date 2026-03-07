"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import StatsCards from "./StatsCards"
import RevenueChart from "./RevenueChart"

export default function Dashboard() {

    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    if (status === "loading") {
        return <p>Loading...</p>
    }

    if (!session) return null

    return (
        <div>

            <h1>Hello ADMIN Dashboard</h1>

            <h2>Hello {session.user.name}</h2>
            <p>{session.user.email}</p>

            <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => signOut({ callbackUrl: "/login" })}
            >
                Logout
            </button>

            <h1 className="text-3xl font-bold mt-6">
                Society Financial Overview
            </h1>

            <StatsCards />

            <RevenueChart />

        </div>
    )
}