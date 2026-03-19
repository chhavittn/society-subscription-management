"use client"

import { forwardRef } from "react"

const ReportContent = forwardRef(({ paymentData, revenueData, totalRevenue }, ref) => {
  return (
    <div
      ref={ref}
      className="p-6 bg-white text-black w-full max-w-3xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold text-center">
        Financial Report
      </h1>

      {/* Total Revenue */}
      <div>
        <h2 className="font-semibold text-lg">Total Revenue</h2>
        <p className="text-xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</p>
      </div>

      {/* Payment Mode Breakdown */}
      <div>
        <h2 className="font-semibold text-lg">Payment Mode Breakdown</h2>
        <table className="w-full border mt-2">
          <thead>
            <tr className="border">
              <th className="p-2 text-left">Mode</th>
              <th className="p-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paymentData.map((item, i) => (
              <tr key={i} className="border">
                <td className="p-2">{item.name}</td>
                <td className="p-2">₹{item.value.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Revenue Over Time */}
      <div>
        <h2 className="font-semibold text-lg">Revenue Over Time</h2>
        <table className="w-full border mt-2">
          <thead>
            <tr className="border">
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-left">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {revenueData.map((item, i) => (
              <tr key={i} className="border">
                <td className="p-2">{item.month}</td>
                <td className="p-2">₹{item.revenue.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center mt-6">
        Generated automatically by Admin Panel
      </p>
    </div>
  )
})

ReportContent.displayName = "ReportContent"

export default ReportContent