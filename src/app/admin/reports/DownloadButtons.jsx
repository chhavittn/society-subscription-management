// "use client"

// import { useEffect, useState, useRef } from "react"
// import axios from "axios"
// import { useReactToPrint } from "react-to-print"
// import { Button } from "@/components/ui/button"
// import ReportContent from "./ReportContent"

// export default function DownloadButtons() {
//   const [paymentData, setPaymentData] = useState([])
//   const [monthlyMap, setMonthlyMap] = useState({})
//   const [yearlyMap, setYearlyMap] = useState({})
//   const [selectedMonth, setSelectedMonth] = useState("")
//   const [selectedYear, setSelectedYear] = useState("")
//   const reportRef = useRef(null)

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem("token")
//       if (!token) return

//       const res = await axios.get("http://localhost:5000/api/v1/admin/payments", {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       })

//       const payments = res.data.payments || []
//       setPaymentData(payments)

//       const monthMapTemp = {} // YYYY-MM => payments
//       const yearMapTemp = {}  // YYYY => payments

//       payments.forEach((p) => {
//         const date = new Date(p.payment_date)
//         const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
//           .toString()
//           .padStart(2, "0")}`
//         if (!monthMapTemp[monthKey]) monthMapTemp[monthKey] = []
//         monthMapTemp[monthKey].push(p)

//         const yearKey = date.getFullYear().toString()
//         if (!yearMapTemp[yearKey]) yearMapTemp[yearKey] = []
//         yearMapTemp[yearKey].push(p)
//       })

//       // Sort months and years
//       const sortedMonths = Object.keys(monthMapTemp).sort()
//       const sortedYears = Object.keys(yearMapTemp).sort()

//       setMonthlyMap(monthMapTemp)
//       setYearlyMap(yearMapTemp)
//       setSelectedMonth(sortedMonths[sortedMonths.length - 1] || "")
//       setSelectedYear(sortedYears[sortedYears.length - 1] || "")
//     }

//     fetchData()
//   }, [])

//   // ----- CSV Downloads -----
//   const downloadMonthlyCSV = () => {
//     const payments = monthlyMap[selectedMonth] || []
//     let csv = `Monthly Report - ${selectedMonth}\nFlat,Owner,Amount,Payment Mode,Payment Date\n`
//     payments.forEach((p) => {
//       const owner = p.user_name || "Unassigned"
//       csv += `${p.flat_number || p.flat_id},${owner},${p.amount},${p.payment_mode},${new Date(p.payment_date).toLocaleDateString()}\n`
//     })

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
//     const link = document.createElement("a")
//     link.href = URL.createObjectURL(blob)
//     link.setAttribute("download", `monthly-report-${selectedMonth}.csv`)
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   const downloadYearlyCSV = () => {
//     const payments = yearlyMap[selectedYear] || []
//     let csv = `Yearly Report - ${selectedYear}\nFlat,Owner,Amount,Payment Mode,Payment Date\n`
//     payments.forEach((p) => {
//       const owner = p.user_name || "Unassigned"
//       csv += `${p.flat_number || p.flat_id},${owner},${p.amount},${p.payment_mode},${new Date(p.payment_date).toLocaleDateString()}\n`
//     })

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
//     const link = document.createElement("a")
//     link.href = URL.createObjectURL(blob)
//     link.setAttribute("download", `yearly-report-${selectedYear}.csv`)
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   // ----- PDF Downloads -----
//   const handlePrintMonthly = useReactToPrint({
//     content: () => reportRef.current,
//     documentTitle: `Monthly Report - ${selectedMonth}`,
//   })

//   const handlePrintYearly = useReactToPrint({
//     content: () => reportRef.current,
//     documentTitle: `Yearly Report - ${selectedYear}`,
//   })

//   return (
//     <div className="space-y-6">
//       {/* Hidden PDF content */}
//       <div style={{ display: "none" }}>
//         <ReportContent
//           ref={reportRef}
//           payments={paymentData}
//           monthlyMap={monthlyMap}
//           yearlyMap={yearlyMap}
//           selectedMonth={selectedMonth}
//           selectedYear={selectedYear}
//         />
//       </div>

//       {/* --- Monthly Report --- */}
//       <div className="flex gap-2 items-center">
//         <label>Monthly Report:</label>
//         <select
//           className="border p-2 rounded"
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//         >
//           {Object.keys(monthlyMap)
//             .sort()
//             .map((month) => (
//               <option key={month} value={month}>
//                 {month}
//               </option>
//             ))}
//         </select>
//         <Button onClick={downloadMonthlyCSV}>Download Monthly CSV</Button>
//         <Button variant="secondary" onClick={handlePrintMonthly}>
//           Download Monthly PDF
//         </Button>
//       </div>

//       {/* --- Yearly Report --- */}
//       <div className="flex gap-2 items-center">
//         <label>Yearly Report:</label>
//         <select
//           className="border p-2 rounded"
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(e.target.value)}
//         >
//           {Object.keys(yearlyMap)
//             .sort()
//             .map((year) => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//         </select>
//         <Button onClick={downloadYearlyCSV}>Download Yearly CSV</Button>
//         <Button variant="secondary" onClick={handlePrintYearly}>
//           Download Yearly PDF
//         </Button>
//       </div>
//     </div>
//   )
// }

"use client"

import { useEffect, useState, useRef, forwardRef } from "react"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"

// Forward ref to ReportContent so react-to-print can access it
const ReportContent = forwardRef(
  ({ monthlyData, yearlyData, selectedMonth, selectedYear }, ref) => {
    return (
      <div ref={ref} className="p-4">
        <h2 className="text-xl font-semibold mb-2">
          {monthlyData.length
            ? `Monthly Report - ${selectedMonth}`
            : `Yearly Report - ${selectedYear}`}
        </h2>
        <table className="border-collapse border w-full">
          <thead>
            <tr>
              <th className="border px-2 py-1">Flat</th>
              <th className="border px-2 py-1">Owner</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Payment Mode</th>
              <th className="border px-2 py-1">Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {(monthlyData.length ? monthlyData : yearlyData).map((p, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{p.flat_number || p.flat_id || "-"}</td>
                <td className="border px-2 py-1">{p.user_name || "Unassigned"}</td>
                <td className="border px-2 py-1">{p.amount}</td>
                <td className="border px-2 py-1">{p.payment_mode}</td>
                <td className="border px-2 py-1">
                  {new Date(p.payment_date).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
)

export default function DownloadButtons() {
  const [monthlyMap, setMonthlyMap] = useState({})
  const [yearlyMap, setYearlyMap] = useState({})
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const reportRef = useRef(null)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await axios.get(
          "http://localhost:5000/api/v1/admin/payments",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        )

        const payments = res.data.payments || []

        const monthly = {}
        const yearly = {}

        payments.forEach((p) => {
          const date = new Date(p.payment_date)
          if (isNaN(date)) return

          // Monthly
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`
          if (!monthly[monthKey]) monthly[monthKey] = []
          monthly[monthKey].push(p)

          // Yearly
          const yearKey = date.getFullYear().toString()
          if (!yearly[yearKey]) yearly[yearKey] = []
          yearly[yearKey].push(p)
        })

        setMonthlyMap(monthly)
        setYearlyMap(yearly)

        // Default selections: latest month and year
        const months = Object.keys(monthly).sort()
        const years = Object.keys(yearly).sort()
        if (months.length) setSelectedMonth(months[months.length - 1])
        if (years.length) setSelectedYear(years[years.length - 1])
      } catch (err) {
        console.error("Error fetching payments:", err)
      }
    }

    fetchPayments()
  }, [])

  const downloadCSV = (payments, type, key) => {
    if (!payments || !payments.length) {
      alert("No data to download")
      return
    }
    let csv = `${type} Revenue Report - ${key}\nFlat,Owner,Amount,Payment Mode,Payment Date\n`
    payments.forEach((p) => {
      const owner = p.user_name || "Unassigned"
      const flat = p.flat_number || p.flat_id || "-"
      const date = new Date(p.payment_date).toLocaleDateString("en-IN")
      csv += `${flat},${owner},${p.amount},${p.payment_mode},${date}\n`
    })
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `${type}-report-${key}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: "Financial Report",
    onBeforeGetContent: () => {
      const payments =
        monthlyMap[selectedMonth] || yearlyMap[selectedYear] || []
      if (!payments.length) {
        alert("No data available to print")
        return null
      }
    },
  })

  return (
    <div className="space-y-4">
      {/* Offscreen ReportContent for printing */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <ReportContent
          ref={reportRef}
          monthlyData={monthlyMap[selectedMonth] || []}
          yearlyData={yearlyMap[selectedYear] || []}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>

      {/* Monthly Selector */}
      <div className="flex gap-2 items-center">
        <label>Monthly Report:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-2 rounded ml-2"
        >
          {Object.keys(monthlyMap)
            .sort()
            .map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
        </select>
        <Button
          onClick={() =>
            downloadCSV(monthlyMap[selectedMonth], "Monthly", selectedMonth)
          }
        >
          Download CSV
        </Button>
        <Button variant="secondary" onClick={handlePrint}>
          Download PDF
        </Button>
      </div>

      {/* Yearly Selector */}
      <div className="flex gap-2 items-center mt-2">
        <label>Yearly Report:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border p-2 rounded ml-2"
        >
          {Object.keys(yearlyMap)
            .sort()
            .map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
        </select>
        <Button
          onClick={() =>
            downloadCSV(yearlyMap[selectedYear], "Yearly", selectedYear)
          }
        >
          Download CSV
        </Button>
        <Button variant="secondary" onClick={handlePrint}>
          Download PDF
        </Button>
      </div>
    </div>
  )
}