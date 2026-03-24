"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentHistory() {
  const payments = [
    { month: "January", amount: "₹1500", status: "Paid" },
    { month: "February", amount: "₹1500", status: "Paid" },
    { month: "March", amount: "₹1500", status: "Pending" },
  ];

  return (
    <Card className="admin-card overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#2d3436]">Payment History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full table-auto">
          <thead className="admin-table-head">
            <tr className="admin-table-head-row text-sm uppercase">
              <th className="px-4 py-3 text-left">Month</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr
                key={payment.month}
                className={`border-t border-[#dfe6e9] ${
                  index % 2 === 0 ? "admin-row-even" : "admin-row-odd"
                } admin-row-hover`}
              >
                <td className="px-4 py-3 text-[#2d3436]">{payment.month}</td>
                <td className="px-4 py-3 font-semibold text-[#2d3436]">{payment.amount}</td>
                <td className="px-4 py-3">
                  <Badge className={payment.status === "Paid" ? "admin-badge-paid" : "admin-badge-pending"}>
                    {payment.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
