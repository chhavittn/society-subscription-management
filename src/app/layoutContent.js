"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function LayoutContent({ children }) {

  const pathname = usePathname();

  const hideLayout =
    pathname === "/login" ||
    pathname === "/register";

  return (
    <div className="flex">

      {!hideLayout && <Sidebar />}

      <div className="flex-1 flex flex-col">

        {!hideLayout && <Navbar />}

        <main className="flex-1 p-6">
          {children}
        </main>

      </div>

    </div>
  );
}