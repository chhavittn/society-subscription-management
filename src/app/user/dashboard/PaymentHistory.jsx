"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"

export default function PaymentHistory() {

  const payments = [
    { month: "January", amount: "₹1500", status: "Paid" },
    { month: "February", amount: "₹1500", status: "Paid" },
    { month: "March", amount: "₹1500", status: "Pending" }
  ]

  return (
    <Card>

      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>

      <CardContent>

        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Month</th>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>

          <tbody>

            {payments.map((payment, index) => (

              <tr key={index} className="border-b">

                <td className="p-2">{payment.month}</td>
                <td className="p-2">{payment.amount}</td>
                <td className="p-2">{payment.status}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </CardContent>

    </Card>
  )
}