// "use client";

// export default function PaymentHistory({ payments = [] }) {

//   const currentMonth = new Date().getMonth() + 1;
//   const currentYear = new Date().getFullYear();

//   const previousPayments = payments.filter(
//     p => !(p.month === currentMonth && p.year === currentYear)
//   );

//   if (previousPayments.length === 0) {
//     return (
//       <p className="text-gray-500">
//         No transactions found in history
//       </p>
//     );
//   }

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">
//         Transaction History
//       </h2>

//       <table className="w-full border">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-2 border">Month</th>
//             <th className="p-2 border">Amount</th>
//             <th className="p-2 border">Status</th>
//             <th className="p-2 border">Transaction</th>
//           </tr>
//         </thead>

//         <tbody>
//           {previousPayments.map((p) => (
//             <tr key={p.id}>
//               <td className="p-2 border">{p.month}/{p.year}</td>
//               <td className="p-2 border">₹{p.amount}</td>
//               <td className="p-2 border">{p.status}</td>
//               <td className="p-2 border">{p.transaction_id}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

"use client";

export default function PaymentHistory({ payments = [] }) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // ✅ Only include payments that are paid and not current month pending
  const previousPayments = payments.filter(
    p =>
      p.status?.toLowerCase() === "paid" &&
      !(p.month === currentMonth && p.year === currentYear && p.status.toLowerCase() !== "paid")
  );

  if (previousPayments.length === 0) {
    return (
      <p className="text-gray-500">No transactions found in history</p>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Month</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Transaction</th>
          </tr>
        </thead>

        <tbody>
          {previousPayments.map((p) => (
            <tr key={p.id}>
              <td className="p-2 border">{p.month}/{p.year}</td>
              <td className="p-2 border">₹{p.amount}</td>
              <td className="p-2 border">{p.status}</td>
              <td className="p-2 border">{p.transaction_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}