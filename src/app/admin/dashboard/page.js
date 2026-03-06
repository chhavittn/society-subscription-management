"use client"

import { useSession, signOut } from "next-auth/react"

export default function Dashboard() {

    const { data: session } = useSession()

    return (
        <div>
               <h1>Hello ADMIN Dashboard</h1>
            <h2>Hello {session?.user?.name}</h2>
            <p>{session?.user?.email}</p>
            <button onClick={() => signOut()}>
                Logout
            </button>
        </div>
    )
}