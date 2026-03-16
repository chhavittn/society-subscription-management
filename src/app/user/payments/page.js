"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PaymentCard from "./PaymentCard";
import PaymentHistory from "./PaymentHistory";

export default function Payments() {

  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {

      const plansRes = await axios.get(
        "http://localhost:5000/api/v1/plans",
        { withCredentials: true }
      );

      const paymentsRes = await axios.get(
        "http://localhost:5000/api/v1/my-payments",
        { withCredentials: true }
      );

      setPlans(plansRes.data.plans);
      setPayments(paymentsRes.data.payments);

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const paidThisMonth = payments.find(
    (p) => p.month === currentMonth && p.year === currentYear
  );

  // last payment
  const lastPayment = payments.length > 0 ? payments[0] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-10">

      <h1 className="text-3xl font-bold">
        Pay Maintenance Subscription
      </h1>

      {/* FIRST TIME USER */}
      {payments.length === 0 && (
        <>
          <h2 className="text-xl font-semibold">
            Choose a Subscription Plan
          </h2>

          <div className="grid gap-6">
            {plans.map((plan) => (
              <PaymentCard
                key={plan.id}
                plan={plan}
                allowPayment={true}
                refreshPayments={fetchData}
              />
            ))}
          </div>
        </>
      )}

      {/* ALREADY PAID THIS MONTH */}
      {paidThisMonth && (
        <>
          <div className="bg-green-50 p-6 rounded-lg border">

            <h2 className="text-xl font-semibold">
              Payment Summary
            </h2>

            <p>Plan: {paidThisMonth.plan_name}</p>
            <p>Total Amount: ₹{paidThisMonth.amount}</p>
            <p>Status: Paid ✔</p>
            <p>Transaction: {paidThisMonth.transaction_id}</p>

          </div>

          <PaymentHistory payments={payments} />
        </>
      )}

      {/* HAS HISTORY BUT NOT PAID THIS MONTH */}
      {!paidThisMonth && payments.length > 0 && (
        <>
          <PaymentCard
            plan={plans.find(p => p.id === lastPayment.plan_id)}
            allowPayment={true}
            refreshPayments={fetchData}
          />

          <PaymentHistory payments={payments} />
        </>
      )}

    </div>
  );
}