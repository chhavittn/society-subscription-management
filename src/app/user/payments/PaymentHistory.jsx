"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentHistory({ payments = [] }) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const previousPayments = payments.filter(
    (payment) =>
      payment.status?.toLowerCase() === "paid" &&
      !(payment.month === currentMonth && payment.year === currentYear && payment.status.toLowerCase() !== "paid")
  );

  if (previousPayments.length === 0) {
    return <p className="text-[#636e72]">No transactions found in history</p>;
  }

  return (
    <Card className="admin-card mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#2d3436]">Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="admin-table-wrap">
          <table className="w-full border-collapse">
            <thead className="admin-table-head">
              <tr className="admin-table-head-row">
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {previousPayments.map((payment, index) => (
                <tr
                  key={payment.id}
                  className={`border-t border-[#dfe6e9] ${
                    index % 2 === 0 ? "admin-row-even" : "admin-row-odd"
                  } admin-row-hover`}
                >
                  <td className="p-3 text-[#2d3436]">{payment.month}/{payment.year}</td>
                  <td className="p-3 text-[#2d3436]">₹{payment.amount}</td>
                  <td className="p-3">
                    <Badge className="admin-badge-paid">Paid</Badge>
                  </td>
                  <td className="p-3 text-[#636e72]">{payment.transaction_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
