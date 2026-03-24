"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentHistory from "./PaymentHistory";
import PaymentModal from "./PaymentModal";

export default function Payments() {
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);

  const receiptRef = useRef(null);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const requestedMonth = Number(searchParams.get("month"));
  const requestedYear = Number(searchParams.get("year"));
  const searchKey = searchParams.toString();

  const selectedPending = pendingPayments.find(
    (payment) => Number(payment.month) === Number(selectedMonth) && Number(payment.year) === Number(selectedYear)
  );

  const selectedPayment = payments.find(
    (payment) => Number(payment.month) === Number(selectedMonth) && Number(payment.year) === Number(selectedYear)
  );

  const receiptDate = selectedPayment?.payment_date
    ? new Date(selectedPayment.payment_date).toLocaleDateString()
    : "-";

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_${selectedMonth}_${selectedYear}`,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const paymentsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/my-payments`, {
        withCredentials: true,
      });
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
        .filter((subscription) => (subscription.status || "").toLowerCase() !== "paid")
        .sort((a, b) => Number(a.year) - Number(b.year) || Number(a.month) - Number(b.month));

      setPendingPayments(pending);

      if (pending.length > 0) {
        const requestedMatch = pending.find(
          (payment) => Number(payment.month) === requestedMonth && Number(payment.year) === requestedYear
        );
        const currentMatch = pending.find(
          (payment) => Number(payment.month) === currentMonth && Number(payment.year) === currentYear
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
  }, [currentMonth, currentYear, requestedMonth, requestedYear]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchData, searchKey]);

  const monthOptions = pendingPayments.map((payment) => ({
    key: `${payment.year}-${String(payment.month).padStart(2, "0")}`,
    label: `${String(payment.month).padStart(2, "0")}/${payment.year}`,
    month: Number(payment.month),
    year: Number(payment.year),
  }));

  if (loading) {
    return <div className="admin-page text-[#636e72]">Loading payments...</div>;
  }

  return (
    <div className="admin-page">
      <div>
        <h1 className="admin-title mb-2">Payments</h1>
      </div>

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={receiptRef}>
          {selectedPayment && selectedPending && (
            <Card className="w-full max-w-md rounded-[28px] border border-[#dfe6e9] bg-white p-6 text-black shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold">Payment Receipt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Flat Type:</strong> {selectedPending.plan_name || "Maintenance"}</p>
                <p><strong>Month/Year:</strong> {selectedPayment.month}/{selectedPayment.year}</p>
                <p><strong>Amount Paid:</strong> ₹{selectedPayment.amount}</p>
                <p><strong>Transaction ID:</strong> {selectedPayment.transaction_id}</p>
                <p><strong>Status:</strong> Paid</p>
                <p><strong>Date:</strong> {receiptDate}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedPending ? (
        <Card className="admin-card p-2">
          <CardHeader>
            <CardTitle className="text-2xl text-[#2d3436]">Pending Maintenance Payment</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-4 sm:p-6">
            {monthOptions.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#636e72]">Select Month</label>
                <select
                  className="admin-native-select w-full"
                  value={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}`}
                  onChange={(e) => {
                    const [yearValue, monthValue] = e.target.value.split("-");
                    setSelectedYear(Number(yearValue));
                    setSelectedMonth(Number(monthValue));
                  }}
                >
                  {monthOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <div className="admin-card space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="stat-label">Flat Type</span>
                  <span className="font-semibold text-[#2d3436]">{selectedPending.plan_name || "Maintenance"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="stat-label">Month/Year</span>
                  <span className="font-semibold text-[#2d3436]">{selectedMonth}/{selectedYear}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="stat-label">Amount</span>
                  <span className="font-semibold text-[#2d3436]">₹{selectedPending.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="stat-label">Status</span>
                  <Badge className={selectedPayment ? "admin-badge-paid" : "admin-badge-pending"}>
                    {selectedPayment ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>

              {!selectedPayment ? (
                <Card className="admin-card p-5">
                  <CardTitle className="mb-3 text-xl text-[#2d3436]">Complete Payment</CardTitle>
                  <PaymentModal
                    amount={selectedPending.amount}
                    planId={selectedPending.plan_id}
                    refreshPayments={fetchData}
                    flatType={selectedPending.plan_name || "Maintenance"}
                    month={selectedMonth}
                    year={selectedYear}
                  />
                </Card>
              ) : (
                <Card className="admin-card p-5">
                  <CardTitle className="mb-3 text-xl text-[#2d3436]">Payment Details</CardTitle>
                  <div className="space-y-2 text-sm text-[#636e72]">
                    <p>Flat Type: <span className="font-medium text-[#2d3436]">{selectedPending.plan_name || "Maintenance"}</span></p>
                    <p>Month/Year: <span className="font-medium text-[#2d3436]">{selectedPayment.month}/{selectedPayment.year}</span></p>
                    <p>Amount Paid: <span className="font-medium text-[#2d3436]">₹{selectedPayment.amount}</span></p>
                    <p>Transaction ID: <span className="font-medium text-[#2d3436]">{selectedPayment.transaction_id}</span></p>
                    <p>Status: <span className="font-medium text-[#00b894]">Paid</span></p>
                  </div>

                  <Button className="admin-btn-secondary mt-5 w-full rounded-xl py-3" onClick={handlePrint}>
                    Download Receipt (PDF)
                  </Button>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="admin-card p-6 text-[#2d3436]">
          <p className="font-medium">No pending payments found for available months.</p>
        </Card>
      )}

      <PaymentHistory payments={payments || []} />
    </div>
  );
}
