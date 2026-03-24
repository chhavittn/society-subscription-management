"use client";

import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function PaymentModal({ amount, planId, refreshPayments, flatType, month, year }) {
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setError("");
    if (!cardNumber || !name || !expiry || !cvv) {
      const message = "Please fill all card details";
      setError(message);
      toast.error(message);
      return;
    }

    const toastId = toast.loading("Processing payment...");

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/pay`,
        { payment_mode: "card", plan_id: planId, month, year },
        { withCredentials: true }
      );

      if (data.success) {
        setPaymentData({
          amount: data?.subscription?.amount ?? amount,
          transaction_id: data?.transaction_id || "-",
        });
        setSuccess(true);
        refreshPayments?.();
        toast.success("Payment successful", { id: toastId });
      }
    } catch (err) {
      const message = err.response?.data?.message || "Payment failed";
      setError(message);
      toast.error(message, { id: toastId });
    }
  };

  const downloadReceipt = () => {
    if (!paymentData) return;
    const receipt = `
Flat Type: ${flatType}
Month/Year: ${month}/${year}
Amount Paid: ₹${paymentData.amount}
Transaction ID: ${paymentData.transaction_id}
Date: ${new Date().toLocaleDateString()}
Status: Paid
    `;
    const blob = new Blob([receipt], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Receipt_${month}_${year}.txt`;
    link.click();
    toast.success("Receipt downloaded");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="admin-btn-primary w-full rounded-xl py-3">Pay Now</Button>
      </DialogTrigger>

      <DialogContent className="admin-modal space-y-4 sm:max-w-lg">
        {!success ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-[#2d3436]">Payment Gateway</DialogTitle>
            </DialogHeader>

            <div className="rounded-2xl bg-white/70 p-4 text-sm text-[#636e72]">
              <p className="font-medium text-[#2d3436]">Amount: ₹{amount}</p>
              <p className="mt-1">Complete the card details below to pay for {flatType}.</p>
            </div>

            <input placeholder="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="admin-input w-full" />
            <input placeholder="Card Holder Name" value={name} onChange={(e) => setName(e.target.value)} className="admin-input w-full" />

            <div className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Expiry (MM/YY)" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="admin-input w-full" />
              <input placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} className="admin-input w-full" />
            </div>

            {error && <p className="text-sm text-[#d63031]">{error}</p>}

            <Button className="admin-btn-primary w-full rounded-xl py-3" onClick={handlePayment}>
              Complete Payment
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-[#00b894]">Payment Successful</h2>
            <p className="text-sm text-[#636e72]">Your receipt is ready to download.</p>

            <div className="admin-card space-y-2 p-4 text-left">
              <p className="text-[#2d3436]">Flat Type: {flatType}</p>
              <p className="text-[#2d3436]">Month/Year: {month}/{year}</p>
              <p className="text-[#2d3436]">Amount Paid: ₹{paymentData.amount}</p>
              <p className="text-[#2d3436]">Transaction ID: {paymentData.transaction_id}</p>
              <p className="text-[#2d3436]">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-[#2d3436]">Status: Paid</p>
            </div>

            <Button className="admin-btn-secondary w-full rounded-xl py-3" onClick={downloadReceipt}>
              Download Receipt
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
