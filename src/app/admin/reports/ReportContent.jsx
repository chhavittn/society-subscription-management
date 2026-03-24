
"use client"

import { forwardRef } from "react"

const ReportContent = forwardRef(
  ({ monthlyData = [], yearlyData = [], selectedMonth, selectedYear }, ref) => {
    return (
      <div
        ref={ref}
        className="p-6 w-full max-w-3xl mx-auto space-y-6 rounded-xl"
        style={{
          background: "#f8fffe",
          color: "#2d3436"
        }}
      >
        <h1 className="text-2xl font-bold text-center">
          Financial Report
        </h1>

        {monthlyData.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mt-4">
              Monthly Revenue Report - {selectedMonth}
            </h2>

            <table className="w-full mt-3 border border-[#dfe6e9] rounded-lg overflow-hidden">
              <thead className="bg-[#e8fffb]">
                <tr>
                  <th className="p-2 text-left text-sm">Flat</th>
                  <th className="p-2 text-left text-sm">Owner</th>
                  <th className="p-2 text-left text-sm">Amount</th>
                  <th className="p-2 text-left text-sm">Mode</th>
                  <th className="p-2 text-left text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((p, i) => (
                  <tr key={i} className="border-t border-[#dfe6e9]">
                    <td className="p-2">{p.flat_number || p.flat_id || "-"}</td>
                    <td className="p-2">{p.user_name || "Unassigned"}</td>
                    <td className="p-2">
                      ₹{parseFloat(p.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-2">{p.payment_mode}</td>
                    <td className="p-2">
                      {p.payment_date
                        ? new Date(p.payment_date).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {yearlyData.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mt-6">
              Yearly Revenue Report - {selectedYear}
            </h2>

            <table className="w-full mt-3 border border-[#dfe6e9] rounded-lg overflow-hidden">
              <thead className="bg-[#eef4ff]">
                <tr>
                  <th className="p-2 text-left text-sm">Flat</th>
                  <th className="p-2 text-left text-sm">Owner</th>
                  <th className="p-2 text-left text-sm">Amount</th>
                  <th className="p-2 text-left text-sm">Mode</th>
                  <th className="p-2 text-left text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((p, i) => (
                  <tr key={i} className="border-t border-[#dfe6e9]">
                    <td className="p-2">{p.flat_number || p.flat_id || "-"}</td>
                    <td className="p-2">{p.user_name || "Unassigned"}</td>
                    <td className="p-2">
                      ₹{parseFloat(p.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-2">{p.payment_mode}</td>
                    <td className="p-2">
                      {p.payment_date
                        ? new Date(p.payment_date).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-center text-sm text-[#636e72] mt-6">
          Generated automatically by Admin Panel
        </p>
      </div>
    )
  }
)

ReportContent.displayName = "ReportContent"

export default ReportContent
