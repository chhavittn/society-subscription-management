"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

export default function LayoutContent({ children }) {

  const pathname = usePathname();

  const hideLayout =
    pathname === "/login" ||
    pathname === "/register";

  return (
    <div className="flex w-full">

      {!hideLayout && <Sidebar />}

      <div className="flex-1 flex flex-col">

        {!hideLayout && <Navbar />}

        <main className="flex-1 p-6">
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#ffffff",
                color: "#1f2937",
                borderRadius: "12px",
                padding: "12px 16px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
              },
              success: {
                style: {
                  border: "1px solid #22c55e",
                },
              },
              error: {
                style: {
                  border: "1px solid #ef4444",
                },
              },
            }}
          />
          {children}
        </main>

      </div>

    </div>
  );
}