"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import PaymentModal from "./PaymentModal";
import PaymentHistory from "./PaymentHistory";

export default function Payments() {
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);

  const receiptRef = useRef(null); // ✅ ref here

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const requestedMonth = Number(searchParams.get("month"));
  const requestedYear = Number(searchParams.get("year"));

  const selectedPending = pendingPayments.find(
    (p) => Number(p.month) === Number(selectedMonth) && Number(p.year) === Number(selectedYear)
  );

  const selectedPayment = payments.find(
    (p) => Number(p.month) === Number(selectedMonth) && Number(p.year) === Number(selectedYear)
  );

  // ✅ PRINT FUNCTION
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_${selectedMonth}_${selectedYear}`,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const paymentsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/my-payments`,
        { withCredentials: true }
      );
      setPayments(paymentsRes.data.payments || []);
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setPayments([]);
    }

    try {
      const subscriptionsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/all`,
        { withCredentials: true }
      );

      const allSubscriptions = subscriptionsRes.data.subscriptions || [];
      const pending = allSubscriptions
        .filter((s) => (s.status || "").toLowerCase() !== "paid")
        .sort((a, b) => {
          if (Number(a.year) !== Number(b.year)) return Number(a.year) - Number(b.year);
          return Number(a.month) - Number(b.month);
        });

      setPendingPayments(pending);

      if (pending.length > 0) {
        const requestedMatch = pending.find(
          (p) => Number(p.month) === requestedMonth && Number(p.year) === requestedYear
        );

        const currentMatch = pending.find(
          (p) => Number(p.month) === currentMonth && Number(p.year) === currentYear
        );

        const initial = requestedMatch || currentMatch || pending[0];
        setSelectedMonth(Number(initial.month));
        setSelectedYear(Number(initial.year));
      } else {
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
      }
    } catch (err) {
      console.error("Error fetching pending subscriptions:", err);
      setPendingPayments([]);
      setSelectedMonth(currentMonth);
      setSelectedYear(currentYear);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const monthOptions = pendingPayments.map((p) => ({
    key: `${p.year}-${p.month}`,
    label: `${String(p.month).padStart(2, "0")}/${p.year}`,
    month: Number(p.month),
    year: Number(p.year),
  }));

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">Pay Maintenance Subscription</h1>

      {/* 🔥 HIDDEN RECEIPT (INSIDE SAME FILE) */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={receiptRef}>

          {/* ✅ ONLY RECEIPT */}
          {selectedPayment && selectedPending && (
            <div className="p-8 max-w-md mx-auto border bg-white">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Payment Receipt
              </h2>

              <div className="space-y-2">
                <p><strong>Flat Type:</strong> {selectedPending.plan_name || "Maintenance"}</p>
                <p><strong>Month/Year:</strong> {selectedPayment.month}/{selectedPayment.year}</p>
                <p><strong>Amount Paid:</strong> ₹{selectedPayment.amount}</p>
                <p><strong>Transaction ID:</strong> {selectedPayment.transaction_id}</p>
                <p><strong>Status:</strong> Paid</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedPayment.payment_date || Date.now()).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-6 text-center">
                <p>---------------------------</p>
                <p>Thank you!</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MAIN UI */}
      {selectedPending && (
        <div className="bg-yellow-50 p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">Pending Maintenance Payment</h2>

          {monthOptions.length > 1 && (
            <div className="space-y-2">
              <p><strong>Select Month</strong></p>
              <select
                className="border rounded p-2 w-full"
                value={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split("-");
                  setSelectedYear(Number(y));
                  setSelectedMonth(Number(m));
                }}
              >
                {monthOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p><strong>Flat Type:</strong> {selectedPending.plan_name || "Maintenance"}</p>
          <p><strong>Month/Year:</strong> {selectedMonth}/{selectedYear}</p>
          <p><strong>Amount:</strong> ₹{selectedPending.amount}</p>

          <p>
            <strong>Status:</strong>{" "}
            <span className={selectedPayment ? "text-green-600" : "text-red-500"}>
              {selectedPayment ? "Paid ✅" : "Pending"}
            </span>
          </p>

          {!selectedPayment && (
            <PaymentModal
              amount={selectedPending.amount}
              planId={selectedPending.plan_id}
              refreshPayments={fetchData}
              flatType={selectedPending.plan_name || "Maintenance"}
              month={selectedMonth}
              year={selectedYear}
            />
          )}

          {selectedPayment && (
            <div className="bg-white border rounded p-4 space-y-2">
              <h3 className="font-semibold text-lg">Payment Details</h3>

              <p>Flat Type: {selectedPending.plan_name || "Maintenance"}</p>
              <p>Month/Year: {selectedPayment.month}/{selectedPayment.year}</p>
              <p>Amount Paid: ₹{selectedPayment.amount}</p>
              <p>Transaction ID: {selectedPayment.transaction_id}</p>
              <p>Status: Paid</p>

              {/* 🔥 DOWNLOAD BUTTON */}
              <button
                onClick={handlePrint}
                className="mt-3 w-full bg-black text-white py-2 rounded"
              >
                Download Receipt (PDF)
              </button>
            </div>
          )}
        </div>
      )}

      {!selectedPending && (
        <div className="bg-green-50 p-6 rounded-lg border">
          <p className="font-medium">No pending payments found for available months.</p>
        </div>
      )}

      <PaymentHistory payments={payments || []} />
    </div>
  );
}
