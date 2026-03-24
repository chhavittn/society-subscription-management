"use client"

import { forwardRef, useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const PrintableReport = forwardRef(function PrintableReport({ title, rows }, ref) {
  return (
    <div ref={ref} className="p-6 bg-white text-black w-full max-w-4xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border px-2 py-1 text-left">Flat</th>
            <th className="border px-2 py-1 text-left">Owner</th>
            <th className="border px-2 py-1 text-left">Amount</th>
            <th className="border px-2 py-1 text-left">Payment Mode</th>
            <th className="border px-2 py-1 text-left">Payment Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{p.flat_number || p.flat_id || "-"}</td>
              <td className="border px-2 py-1">{p.user_name || "Unassigned"}</td>
              <td className="border px-2 py-1">₹{Number(p.amount || 0).toLocaleString("en-IN")}</td>
              <td className="border px-2 py-1">{p.payment_mode || "-"}</td>
              <td className="border px-2 py-1">
                {p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN") : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

function parseMonth(paymentDate) {
  const d = new Date(paymentDate)
  if (Number.isNaN(d.getTime())) return null
  return { year: d.getFullYear(), month: d.getMonth() + 1, time: d.getTime() }
}

function downloadCSV(rows, fileName, title) {
  if (!rows.length) {
    toast.error("No data to download")
    return
  }

  let csv = `${title}\nFlat,Owner,Amount,Payment Mode,Payment Date\n`
  rows.forEach((p) => {
    const flat = p.flat_number || p.flat_id || "-"
    const owner = p.user_name || "Unassigned"
    const amount = Number(p.amount || 0)
    const mode = p.payment_mode || "-"
    const date = p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN") : "-"
    csv += `${flat},${owner},${amount},${mode},${date}\n`
  })

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.setAttribute("download", fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function DownloadButtons() {
  const [payments, setPayments] = useState([])
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")

  const monthlyPrintRef = useRef(null)
  const yearlyPrintRef = useRef(null)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  useEffect(() => {
    const fetchAllPayments = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const all = []
        let page = 1
        const pageSize = 500

        while (true) {
          const res = await axios.get(
            `http://localhost:5000/api/v1/admin/payments?page=${page}&limit=${pageSize}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          )

          const batch = res.data.payments || []
          all.push(...batch)
          if (batch.length < pageSize) break
          page += 1
        }

        setPayments(all)
      } catch (err) {
        console.error("Error fetching payments:", err)
      }
    }

    fetchAllPayments()
  }, [])

  const paidPayments = useMemo(() => {
    return payments
      .filter((p) => {
        const status = (p.status || "").toLowerCase()
        return status === "paid" || status === "success"
      })
      .map((p) => {
        const parsed = parseMonth(p.payment_date)
        return parsed ? { ...p, _year: parsed.year, _month: parsed.month, _time: parsed.time } : null
      })
      .filter(Boolean)
      .sort((a, b) => a._time - b._time)
  }, [payments])

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(paidPayments.map((p) => p._year))).sort((a, b) => a - b)
    return years
  }, [paidPayments])

  useEffect(() => {
    if (!availableYears.length) return

    const defaultYear = availableYears.includes(currentYear)
      ? currentYear
      : availableYears[availableYears.length - 1]

    setSelectedYear(String(defaultYear))
  }, [availableYears, currentYear])

  useEffect(() => {
    if (!selectedYear) return
    const yearNum = Number(selectedYear)
    const maxMonth = yearNum === currentYear ? currentMonth : 12
    setSelectedMonth(String(maxMonth).padStart(2, "0"))
  }, [selectedYear, currentYear, currentMonth])

  const monthOptions = useMemo(() => {
    if (!selectedYear) return []
    const yearNum = Number(selectedYear)
    const maxMonth = yearNum === currentYear ? currentMonth : 12
    return Array.from({ length: maxMonth }, (_, i) => i + 1)
  }, [selectedYear, currentYear, currentMonth])

  const monthlyRows = useMemo(() => {
    if (!selectedYear || !selectedMonth) return []
    const y = Number(selectedYear)
    const m = Number(selectedMonth)
    return paidPayments.filter((p) => p._year === y && p._month <= m)
  }, [paidPayments, selectedYear, selectedMonth])

  const yearlyRows = useMemo(() => {
    if (!selectedYear) return []
    const y = Number(selectedYear)
    const maxMonth = y === currentYear ? currentMonth : 12
    return paidPayments.filter((p) => p._year === y && p._month <= maxMonth)
  }, [paidPayments, selectedYear, currentYear, currentMonth])

  const monthlyTitle = selectedYear && selectedMonth
    ? `Monthly Revenue Report (${selectedYear}) - Jan to ${MONTH_NAMES[Number(selectedMonth) - 1]}`
    : "Monthly Revenue Report"

  const yearlyTitle = selectedYear
    ? `Yearly Revenue Report (${selectedYear}) - Till ${selectedYear === String(currentYear) ? MONTH_NAMES[currentMonth - 1] : "December"}`
    : "Yearly Revenue Report"

  const handlePrintMonthly = useReactToPrint({
    contentRef: monthlyPrintRef,
    documentTitle: `monthly-report-${selectedYear || "year"}-till-${selectedMonth || "month"}`,
  })

  const handlePrintYearly = useReactToPrint({
    contentRef: yearlyPrintRef,
    documentTitle: `yearly-report-${selectedYear || "year"}`,
  })

  const onDownloadMonthlyPdf = async () => {
    if (!monthlyRows.length) {
      toast.error("No data to download")
      return
    }

    await handlePrintMonthly()
  }

  const onDownloadYearlyPdf = async () => {
    if (!yearlyRows.length) {
      toast.error("No data to download")
      return
    }

    await handlePrintYearly()
  }

  return (
    <div className="admin-card p-6 space-y-6">
      <div className="absolute left-[-9999px] top-0">
        <PrintableReport
          ref={monthlyPrintRef}
          title={monthlyTitle}
          rows={monthlyRows}
        />
        <PrintableReport
          ref={yearlyPrintRef}
          title={yearlyTitle}
          rows={yearlyRows}
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm font-semibold text-[#2d3436]">
          Year:
        </label>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="admin-native-select"
        >
          {availableYears.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm font-semibold text-[#2d3436]">
          Monthly Report:
        </label>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="admin-native-select"
        >
          {monthOptions.map((m) => (
            <option key={m} value={String(m).padStart(2, "0")}>
              {MONTH_NAMES[m - 1]}
            </option>
          ))}
        </select>

        <Button
          className="admin-btn-primary"
          onClick={() =>
            downloadCSV(
              monthlyRows,
              `monthly-report-${selectedYear || "year"}-till-${selectedMonth || "month"}.csv`,
              monthlyTitle
            )
          }
        >
          Download CSV
        </Button>

        <Button
          variant="outline"
          className="admin-btn-ghost"
          onClick={onDownloadMonthlyPdf}
        >
          Download PDF
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm font-semibold text-[#2d3436]">
          Yearly Report:
        </label>

        <Button
          className="admin-btn-secondary"
          onClick={() =>
            downloadCSV(
              yearlyRows,
              `yearly-report-${selectedYear || "year"}.csv`,
              yearlyTitle
            )
          }
        >
          Download CSV
        </Button>

        <Button
          variant="outline"
          className="admin-btn-ghost"
          onClick={onDownloadYearlyPdf}
        >
          Download PDF
        </Button>
      </div>
    </div>
  )
}
