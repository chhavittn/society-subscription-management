"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import StatsCards from "./StatsCards"
import RevenueChart from "./RevenueChart"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/redux/slices/authSlice"

export default function Dashboard() {
    const { data: session, status } = useSession()
    const [userData,setUserData] = useState(null);
    const dispatch = useDispatch();
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
    const router = useRouter()
    
    const handleLogOut = () => {
            if(user) {
                dispatch(logout())
                router.push("/login");
            } else if(session) {
                if(!user) {
                    signOut({callbackUrl: "/login"})
                }
            }
    }

    useEffect(() => {
        
        if (status === "loading") return;

        if (!session && !isAuthenticated) {
            router.push("/login");
        }

        if(session) {
            setUserData(session?.user)
        } else {
            setUserData(user)
        }

    }, [status, session, isAuthenticated, router]);

    if (status === "loading" || loading) {
        return <p>Loading...</p>
    }

    if (!session && !isAuthenticated) return null

    return (
        <div>
            <h1>Hello ADMIN Dashboard</h1>

            <h2>Hello {userData?.name}</h2>
            <p>{userData?.email}</p>

            <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleLogOut}
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