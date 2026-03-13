"use client";

import { useSelector } from "react-redux";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function LayoutContent({ children }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="flex">
      <Sidebar />
      {/* <Navbar /> */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}