"use client"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Sidebar from "./components/Sidebar"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <Sidebar role="admin" />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}