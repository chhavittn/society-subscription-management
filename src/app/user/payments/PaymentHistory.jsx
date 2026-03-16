"use client";

export default function PaymentHistory({ payments }) {

  if (!payments.length) return null;

  return (
    <div>

      <h2 className="text-xl font-semibold mb-4">
        Transaction History
      </h2>

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
          {payments.map((p) => (
            <tr key={p.id}>

              <td className="p-2 border">
                {p.month}/{p.year}
              </td>

              <td className="p-2 border">
                ₹{p.amount}
              </td>

              <td className="p-2 border">
                {p.status}
              </td>

              <td className="p-2 border">
                {p.transaction_id}
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}