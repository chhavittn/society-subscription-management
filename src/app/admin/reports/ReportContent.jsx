// "use client"

// import { forwardRef } from "react"

// const ReportContent = forwardRef(
//   ({ payments, monthlyMap, yearlyMap, selectedMonth, selectedYear }, ref) => {
//     const formatCurrency = (num) => `₹${parseFloat(num).toLocaleString("en-IN")}`

//     return (
//       <div ref={ref} className="p-6 bg-white text-black w-full max-w-3xl mx-auto space-y-6">
//         <h1 className="text-2xl font-bold text-center">Financial Report</h1>

//         {/* --- Monthly Report --- */}
//         {selectedMonth && monthlyMap[selectedMonth] && (
//           <div>
//             <h2 className="text-xl font-semibold mt-4">
//               Monthly Revenue Report - {selectedMonth}
//             </h2>
//             <table className="w-full border mt-2">
//               <thead>
//                 <tr className="border">
//                   <th className="p-2 text-left">Flat</th>
//                   <th className="p-2 text-left">Owner</th>
//                   <th className="p-2 text-left">Amount</th>
//                   <th className="p-2 text-left">Payment Mode</th>
//                   <th className="p-2 text-left">Payment Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {monthlyMap[selectedMonth].map((p, i) => (
//                   <tr key={i} className="border">
//                     <td className="p-2">{p.flat_number || p.flat_id}</td>
//                     <td className="p-2">{p.user_name || "Unassigned"}</td>
//                     <td className="p-2">{formatCurrency(p.amount)}</td>
//                     <td className="p-2">{p.payment_mode}</td>
//                     <td className="p-2">{new Date(p.payment_date).toLocaleDateString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* --- Yearly Report --- */}
//         {selectedYear && yearlyMap[selectedYear] && (
//           <div>
//             <h2 className="text-xl font-semibold mt-6">
//               Yearly Revenue Report - {selectedYear}
//             </h2>
//             <table className="w-full border mt-2">
//               <thead>
//                 <tr className="border">
//                   <th className="p-2 text-left">Flat</th>
//                   <th className="p-2 text-left">Owner</th>
//                   <th className="p-2 text-left">Amount</th>
//                   <th className="p-2 text-left">Payment Mode</th>
//                   <th className="p-2 text-left">Payment Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {yearlyMap[selectedYear].map((p, i) => (
//                   <tr key={i} className="border">
//                     <td className="p-2">{p.flat_number || p.flat_id}</td>
//                     <td className="p-2">{p.user_name || "Unassigned"}</td>
//                     <td className="p-2">{formatCurrency(p.amount)}</td>
//                     <td className="p-2">{p.payment_mode}</td>
//                     <td className="p-2">{new Date(p.payment_date).toLocaleDateString()}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     )
//   }
// )

// ReportContent.displayName = "ReportContent"
// export default ReportContent
"use client"

import { forwardRef } from "react"

const ReportContent = forwardRef(
  ({ monthlyData = [], yearlyData = [], selectedMonth, selectedYear }, ref) => {
    return (
      <div
        ref={ref}
        className="p-6 bg-white text-black w-full max-w-3xl mx-auto space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">Financial Report</h1>

        {/* Monthly Report */}
        {monthlyData.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-4">
              Monthly Revenue Report - {selectedMonth}
            </h2>
            <table className="w-full border mt-2">
              <thead>
                <tr className="border">
                  <th className="p-2 text-left">Flat</th>
                  <th className="p-2 text-left">Owner</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Payment Mode</th>
                  <th className="p-2 text-left">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((p, i) => (
                  <tr key={i} className="border">
                    <td className="p-2">{p.flat_number || p.flat_id || "-"}</td>
                    <td className="p-2">{p.user_name || "Unassigned"}</td>
                    <td className="p-2">₹{parseFloat(p.amount).toLocaleString("en-IN")}</td>
                    <td className="p-2">{p.payment_mode}</td>
                    <td className="p-2">
                      {new Date(p.payment_date).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Yearly Report */}
        {yearlyData.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-6">
              Yearly Revenue Report - {selectedYear}
            </h2>
            <table className="w-full border mt-2">
              <thead>
                <tr className="border">
                  <th className="p-2 text-left">Flat</th>
                  <th className="p-2 text-left">Owner</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Payment Mode</th>
                  <th className="p-2 text-left">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((p, i) => (
                  <tr key={i} className="border">
                    <td className="p-2">{p.flat_number || p.flat_id || "-"}</td>
                    <td className="p-2">{p.user_name || "Unassigned"}</td>
                    <td className="p-2">₹{parseFloat(p.amount).toLocaleString("en-IN")}</td>
                    <td className="p-2">{p.payment_mode}</td>
                    <td className="p-2">
                      {new Date(p.payment_date).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-center mt-6">Generated automatically by Admin Panel</p>
      </div>
    )
  }
)

ReportContent.displayName = "ReportContent"

export default ReportContent