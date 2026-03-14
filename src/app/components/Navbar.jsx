"use client"

import { useSelector, useDispatch } from "react-redux"
import { logout } from "@/redux/slices/authSlice"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Navbar() {

  const { data: session } = useSession()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const dispatch = useDispatch()
  const router = useRouter()

  const userData = session?.user || user

  const handleLogout = () => {

    if (session) {
      signOut({ callbackUrl: "/login" })
    } else {
      dispatch(logout())
      router.push("/login")
    }

  }

  return (
    <nav className="flex justify-between items-center bg-gray-800 text-white px-6 py-3">

      <h1 className="font-semibold text-lg">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">

        {(session || isAuthenticated) ? (
          <>
            <span>{userData?.name}</span>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-blue-500 px-3 py-1 rounded"
          >
            Login
          </Link>
        )}

      </div>

    </nav>
  )
}