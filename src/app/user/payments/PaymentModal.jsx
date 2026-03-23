"use client";

import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      setError("Please fill all card details");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/pay",
        {
          payment_mode: "card",
          plan_id: planId,
          month,
          year
        },
        { withCredentials: true }
      );

      if (data.success) {
        setPaymentData({
          amount: data?.subscription?.amount ?? amount,
          transaction_id: data?.transaction_id || "-",
        });
        setSuccess(true);
        if (refreshPayments) refreshPayments();
      }

    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
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
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Pay Now</Button>
      </DialogTrigger>

      <DialogContent>
        {!success ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Payment Gateway</DialogTitle>
            </DialogHeader>

            <p>Amount: ₹{amount}</p>

            <input placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="border p-2 w-full" />
            <input placeholder="Card Holder Name" value={name} onChange={e => setName(e.target.value)} className="border p-2 w-full" />
            <input placeholder="Expiry (MM/YY)" value={expiry} onChange={e => setExpiry(e.target.value)} className="border p-2 w-full" />
            <input placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value)} className="border p-2 w-full" />

            {error && <p className="text-red-500">{error}</p>}

            <Button className="w-full" onClick={handlePayment}>Complete Payment</Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-green-600">Payment Successful</h2>
            <p>Receipt Generated</p>

            <div className="border p-4 rounded space-y-2">
              <p>Flat Type: {flatType}</p>
              <p>Month/Year: {month}/{year}</p>
              <p>Amount Paid: ₹{paymentData.amount}</p>
              <p>Transaction ID: {paymentData.transaction_id}</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Status: Paid</p>
            </div>

            <Button onClick={downloadReceipt} className="mt-2 w-full">Download Receipt</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
