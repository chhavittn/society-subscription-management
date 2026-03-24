"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { loadUser } from "@/redux/slices/authSlice";
import AdminSidebar from "./AdminSidebar";
import UserSidebar from "./UserSidebar";

export default function Sidebar({ onNavigate }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const role = user?.role ?? session?.user?.role;

  useEffect(() => {
    if (token && !user && !loading) {
      dispatch(loadUser());
    }
  }, [dispatch, token, user, loading]);

  useEffect(() => {
    if (status === "loading" || loading) return;

    if (!session && !isAuthenticated) {
      router.push("/login");
    }
  }, [session, status, isAuthenticated, loading, router]);

  if (status === "loading" || loading) return null;
  if (!session && !isAuthenticated) return null;
  if (token && !user) return null;

  if (role === "admin") {
    return <AdminSidebar onNavigate={onNavigate} />;
  }

  return <UserSidebar onNavigate={onNavigate} />;
}
