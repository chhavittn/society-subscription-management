"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import PaymentModal from "./PaymentModal";
import PaymentHistory from "./PaymentHistory";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const receiptRef = useRef(null); // ✅ ref here

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentPayment = payments.find(
    (p) => p.month === currentMonth && p.year === currentYear
  );

  // ✅ PRINT FUNCTION
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_${currentMonth}_${currentYear}`,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const paymentsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/my-payments`,
        { withCredentials: true }
      );
      setPayments(paymentsRes.data.payments);

      const pendingRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/my-pending-payment`,
        { withCredentials: true }
      );
      setPendingPayment(pendingRes.data.pending || null);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">Pay Maintenance Subscription</h1>

      {/* 🔥 HIDDEN RECEIPT (INSIDE SAME FILE) */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={receiptRef}>

          {/* ✅ ONLY RECEIPT */}
          {currentPayment && pendingPayment && (
            <div className="p-8 max-w-md mx-auto border bg-white">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Payment Receipt
              </h2>

              <div className="space-y-2">
                <p><strong>Flat Type:</strong> {pendingPayment.flat_type}</p>
                <p><strong>Month/Year:</strong> {currentPayment.month}/{currentPayment.year}</p>
                <p><strong>Amount Paid:</strong> ₹{currentPayment.amount}</p>
                <p><strong>Transaction ID:</strong> {currentPayment.transaction_id}</p>
                <p><strong>Status:</strong> Paid</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(currentPayment.payment_date || Date.now()).toLocaleDateString()}
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
      {pendingPayment && (
        <div className="bg-yellow-50 p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-semibold">Current Month Payment</h2>

          <p><strong>Flat Type:</strong> {pendingPayment.flat_type}</p>
          <p><strong>Amount:</strong> ₹{pendingPayment.amount}</p>

          <p>
            <strong>Status:</strong>{" "}
            <span className={currentPayment ? "text-green-600" : "text-red-500"}>
              {currentPayment ? "Paid ✅" : "Pending"}
            </span>
          </p>

          {!currentPayment && (
            <PaymentModal
              amount={pendingPayment.amount}
              planId={pendingPayment.plan_id}
              refreshPayments={fetchData}
              flatType={pendingPayment.flat_type}
              month={currentMonth}
              year={currentYear}
            />
          )}

          {currentPayment && (
            <div className="bg-white border rounded p-4 space-y-2">
              <h3 className="font-semibold text-lg">Payment Details</h3>

              <p>Flat Type: {pendingPayment.flat_type}</p>
              <p>Month/Year: {currentPayment.month}/{currentPayment.year}</p>
              <p>Amount Paid: ₹{currentPayment.amount}</p>
              <p>Transaction ID: {currentPayment.transaction_id}</p>
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

      <PaymentHistory payments={payments || []} />
    </div>
  );
}