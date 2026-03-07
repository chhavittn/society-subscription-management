"use client"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Sidebar from "./components/Sidebar"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <div className="flex">
            <Sidebar role="admin" />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}