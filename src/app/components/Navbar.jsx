"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="logo font-bold text-xl cursor-pointer" onClick={() => router.push("/")}>
        MyApp
      </div>

      <div className="links flex items-center gap-6">
        <a href="/" className="hover:text-gray-400">Home</a>
        {isAuthenticated && <a href="/profile" className="hover:text-gray-400">Profile</a>}
        {user?.role === "admin" && <a href="/admin" className="hover:text-gray-400">Dashboard</a>}

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="font-medium">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <a href="/login" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">
            Login
          </a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;