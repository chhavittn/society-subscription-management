"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";
import { loadUser, logout } from "@/redux/slices/authSlice";
import Notifications from "../user/dashboard/Notifications";
import { toast } from "react-hot-toast";

export default function Navbar({ onMenuClick }) {
  const { data: session, status } = useSession();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (token && !user && !loading) {
      dispatch(loadUser());
    }
  }, [dispatch, token, user, loading]);

  if (status === "loading" || loading) return null;

  const userData = user || session?.user || {};
  const role = user?.role ?? session?.user?.role ?? "resident";
  const roleLabel = role === "admin" ? "Admin" : "Resident";

  const handleLogout = async () => {
    try {
      dispatch(logout());
      toast.success("Logged out successfully");
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  return (
    <nav className="app-navbar">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="app-hamburger lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-[#2d3436] sm:text-xl">
              Welcome back, {userData?.name || "Member"}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {(session || isAuthenticated) && token ? (
          <Notifications token={token} />
        ) : null}

        {(session || isAuthenticated) ? (
          <div className="flex items-center gap-3 rounded-full border border-[#dfe6e9] bg-[#f4faf9] px-3 py-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#2d3436]">
                {userData?.name || "User"}
              </p>
              <p className="text-xs text-[#636e72]">
                {userData?.email || "Member"}
              </p>
            </div>

            <span className="rounded-full bg-[#00cec9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              {roleLabel}
            </span>

            <button
              onClick={handleLogout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d63031] text-white transition hover:opacity-95"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link href="/login" className="admin-btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
