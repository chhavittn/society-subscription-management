"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hideLayout = pathname === "/login" || pathname === "/register";

  return (
    <div className={hideLayout ? "min-h-screen" : "app-shell"}>
      {!hideLayout && (
        <>
          <div className="hidden lg:block lg:w-[292px] lg:flex-none">
            <div className="app-sidebar h-full px-5 py-6">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>

          <div
            className={`fixed inset-0 z-40 bg-[#2d3436]/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
              sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => setSidebarOpen(false)}
          />

          <div
            className={`fixed inset-y-0 left-0 z-50 w-[292px] max-w-[85vw] px-5 py-6 transition-transform duration-300 lg:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="app-sidebar rounded-r-[28px] px-5 py-6">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {!hideLayout && (
          <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        )}

        <main className={hideLayout ? "" : "app-main"}>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#ffffff",
                color: "#2d3436",
                borderRadius: "16px",
                padding: "12px 16px",
                border: "1px solid rgba(9, 132, 227, 0.12)",
                boxShadow:
                  "rgba(50, 50, 93, 0.2) 0px 10px 20px -8px, rgba(0, 0, 0, 0.16) 0px 8px 16px -10px",
              },
            }}
          />
          <div className={hideLayout ? "" : "app-main-inner"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
