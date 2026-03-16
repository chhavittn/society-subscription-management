"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentModal from "./PaymentModal";

export default function PaymentCard({ plan, allowPayment, payment, refreshPayments }) {

  if (!plan) return null;

  return (
    <Card>

      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        <p className="text-gray-600">
          Amount
        </p>

        <p className="text-3xl font-bold">
          ₹{plan.amount}
        </p>

        {payment && (
          <p className="text-green-600 font-medium">
            ✔ Paid for {payment.month}/{payment.year}
          </p>
        )}

        {allowPayment && (
          <PaymentModal
            amount={plan.amount}
            planId={plan.id}
            refreshPayments={refreshPayments}
          />
        )}

      </CardContent>

    </Card>
  );
}