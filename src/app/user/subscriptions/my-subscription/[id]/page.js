"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";

export default function ReceiptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/v1/my-subscription/${id}`,
          { withCredentials: true }
        );
        if (data.success) setSubscription(data.subscription);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: subscription ? `receipt-${subscription.id}` : "receipt",
  });

  if (loading) return <div className="admin-page text-[#636e72]">Loading receipt...</div>;
  if (!subscription) return <div className="admin-page text-[#d63031]">Receipt not found</div>;

  if (subscription.status?.toLowerCase() === "pending") {
    router.push(`/user/payments?month=${subscription.month}&year=${subscription.year}`);
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-card mx-auto w-full max-w-2xl space-y-6 p-6">
        <div ref={receiptRef} className="space-y-4 rounded-[24px] bg-white/75 p-6">
          <h1 className="text-center text-2xl font-bold text-[#2d3436]">Subscription Receipt</h1>

          <div className="space-y-1 text-[#2d3436]">
            <p><strong>Name:</strong> {subscription.user_name}</p>
            <p><strong>Email:</strong> {subscription.user_email}</p>
            <p><strong>Flat:</strong> {subscription.flat_number}</p>
          </div>

          <div className="space-y-1 text-[#2d3436]">
            <p><strong>Plan:</strong> {subscription.plan_name || "N/A"}</p>
            <p><strong>Month:</strong> {subscription.month} / {subscription.year}</p>
            <p><strong>Amount:</strong> ₹{Number(subscription.amount).toFixed(2)}</p>
            <p><strong>Status:</strong> {subscription.status}</p>
          </div>

          <div className="space-y-1 text-[#2d3436]">
            <p><strong>Payment Mode:</strong> {subscription.payment_mode || "-"}</p>
            <p><strong>Transaction ID:</strong> {subscription.transaction_id || "-"}</p>
            <p>
              <strong>Payment Date:</strong>{" "}
              {subscription.payment_date ? new Date(subscription.payment_date).toLocaleDateString() : "-"}
            </p>
          </div>

          <p className="text-center text-[#636e72]">Thank you for your payment!</p>
        </div>

        <Button onClick={handlePrint} className="admin-btn-secondary rounded-xl px-5 py-3">
          Download / Print PDF
        </Button>
      </div>
    </div>
  );
}
