"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentModal from "./PaymentModal";

export default function PaymentCard({ plan, allowPayment, payment, refreshPayments }) {
  if (!plan) return null;

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#2d3436]">{plan.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline space-x-2">
          <p className="font-medium text-[#636e72]">Amount:</p>
          <p className="text-2xl font-bold text-[#2d3436]">₹{plan.amount}</p>
        </div>

        {payment && <Badge className="admin-badge-paid">Paid for {payment.month}/{payment.year}</Badge>}

        {allowPayment && (
          <PaymentModal
            amount={plan.amount}
            planId={plan.id}
            refreshPayments={refreshPayments}
            flatType={plan.name}
            month={plan.month}
            year={plan.year}
          />
        )}
      </CardContent>
    </Card>
  );
}
