"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import SubscriptionStatus from "./SubscriptionStatus"
import PaymentHistory from "./PaymentHistory"
import Notifications from "./Notifications"

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
            <h1>Hello USER Dashboard</h1>
            <h2>Hello {session?.user?.name}</h2>
            <p>{session?.user?.email}</p>
             <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => signOut({ callbackUrl: "/login" })}
            >
                Logout
            </button>
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
    )
}