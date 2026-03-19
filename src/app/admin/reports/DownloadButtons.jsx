"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import ReportContent from "./ReportContent"

export default function AdminReports() {
  const [paymentData, setPaymentData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const reportRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:5000/api/v1/admin/payments", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })

      const payments = res.data.payments || []

      let total = 0
      const modeMap = {}
      const revenueMap = {}

      payments.forEach(p => {
        const amt = parseFloat(p.amount) || 0
        total += amt

        const mode = p.payment_mode?.toLowerCase() || "unknown"
        const formattedMode = mode.charAt(0).toUpperCase() + mode.slice(1)

        if (!modeMap[formattedMode]) modeMap[formattedMode] = 0
        modeMap[formattedMode] += amt

        const date = new Date(p.payment_date)
        const month = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`

        if (!revenueMap[month]) revenueMap[month] = 0
        revenueMap[month] += amt
      })

      setTotalRevenue(total)

      setPaymentData(
        Object.keys(modeMap).map(key => ({
          name: key,
          value: modeMap[key]
        }))
      )

      setRevenueData(
        Object.keys(revenueMap)
          .sort()
          .map(key => ({
            month: key,
            revenue: revenueMap[key]
          }))
      )
    }

    fetchData()
  }, [])

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: "Financial Report"
  })
  const handleDownloadCSV = () => {
    let csv = ""

    // ---- Total Revenue ----
    csv += "Financial Report\n"
    csv += `Total Revenue,${totalRevenue}\n\n`

    // ---- Payment Mode Breakdown ----
    csv += "Payment Mode Breakdown\n"
    csv += "Mode,Amount\n"
    paymentData.forEach(item => {
      csv += `${item.name},${item.value}\n`
    })

    // ---- Revenue Over Time ----
    csv += "\nRevenue Over Time\n"
    csv += "Month,Revenue\n"
    revenueData.forEach(item => {
      csv += `${item.month},${item.revenue}\n`
    })

    // ---- Download logic ----
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "financial-report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Hidden printable report */}
      <div style={{ display: "none" }}>
        <ReportContent
          ref={reportRef}
          paymentData={paymentData}
          revenueData={revenueData}
          totalRevenue={totalRevenue}
        />
      </div>
      <div className="flex gap-4">
        <Button onClick={handleDownloadCSV}>
          Download CSV
        </Button>

        <Button variant="secondary" onClick={handlePrint}>
          Download Financial Report (PDF)
        </Button>
      </div>
    </div>
  )
}