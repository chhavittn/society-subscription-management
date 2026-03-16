"use client"
import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "@/redux/slices/authSlice"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Notifications from "../user/dashboard/Notifications";

export default function Navbar() {
  const { data: session, status } = useSession()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  if (status === "loading") return null

  const userData = session?.user || user
  console.log(session?.user, user, userData);

  const handleLogout = () => {
    if (session) {
      signOut({ callbackUrl: "/login" })
    } else {
      dispatch(logout())
      router.push("/login")
    }
  }

  return (
    <nav className="flex justify-between items-center bg-gray-900 text-white px-6 py-3 shadow">

      <h1 className="font-semibold text-lg tracking-wide">
        Dashboard
      </h1>
      <div className="flex items-center gap-4">
        {(session || isAuthenticated) && token && (  // only render Notifications if token exists
          <>
            <Notifications token={token} />
          </>
        )}
        {!token && <p>Loading...</p>}
      </div>
      <div className="flex items-center gap-4">
        {(session || isAuthenticated) ? (
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-200">
              {userData?.role || "NO"}
            </span>
            <div className="flex items-center gap-3">

              <div className="hidden flex-col items-end sm:flex">

                <span className="text-sm font-semibold text-gray-200">
                  {userData?.name || "User"}
                </span>
                <span className="text-xs text-gray-400">
                  {userData?.email || "Member"}
                </span>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 border border-gray-600 text-sm font-bold text-white">
                {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
              </div>

            </div>

            <div className="h-6 w-px bg-gray-600 hidden sm:block"></div>

            <button
              onClick={handleLogout}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-red-500 hover:text-white"
            >
              Logout
            </button>

          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Login
          </Link>
        )}
      </div>

    </nav>
  )
}