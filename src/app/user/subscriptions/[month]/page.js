"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

export default function SubscriptionDetails() {
  const router = useRouter();
  const params = useParams();
  const receiptRef = useRef(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  const months = [
    { name: "January", value: "01" },
    { name: "February", value: "02" },
    { name: "March", value: "03" },
    { name: "April", value: "04" },
    { name: "May", value: "05" },
    { name: "June", value: "06" },
    { name: "July", value: "07" },
    { name: "August", value: "08" },
    { name: "September", value: "09" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" },
  ];

  const selectedMonth =
    params.month || `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_${subscription?.id}`,
  });

  const handleDownloadReceipt = () => {
    if (!subscription) {
      toast.error("No receipt available to download");
      return;
    }

    handlePrint();
    toast.success("Receipt download started");
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://localhost:5000/api/v1/subscriptions/${selectedMonth}`,
          { withCredentials: true }
        );

        if (data.subscriptions?.length > 0) {
          setSubscription(data.subscriptions[0]);
          setError(null);
        } else {
          setSubscription(null);
          setError("No subscription found for this month.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load subscription.");
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [selectedMonth]);

  const handleMonthChange = (e) => {
    router.push(`/user/subscriptions/${currentYear}-${e.target.value}`);
  };

  if (loading) {
    return (
      <div className="admin-page flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0984e3]" />
      </div>
    );
  }

  const breakdown = subscription
    ? [{
        name:
          subscription.plan_name ||
          subscription.flat_type ||
          "Maintenance Charge",
        amount: subscription.amount
      }]
    : [];

  const totalAmount = subscription?.amount || 0;
  const monthName = months.find((month) => month.value === selectedMonth?.split("-")[1])?.name;

  return (
    <div className="admin-page">
      <div style={{ position: "absolute", left: "-9999px" }}>
        <div ref={receiptRef}>
          <div className="w-full max-w-md rounded-[28px] border border-[#dfe6e9] bg-white p-8 text-black shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-center">Payment Receipt</h2>
            <div className="mb-4 space-y-1">
              <p><strong>Name:</strong> {subscription?.user_name}</p>
              <p><strong>Flat:</strong> {subscription?.flat_number}</p>
              <p><strong>Block:</strong> {subscription?.block || "-"}</p>
              <p><strong>Plan:</strong> {subscription?.plan_name || subscription?.flat_type || "-"}</p>
            </div>
            <div className="mb-4 space-y-1">
              <p><strong>Month:</strong> {subscription?.month}/{subscription?.year}</p>
              <p><strong>Amount:</strong> ₹{subscription?.amount}</p>
              <p><strong>Status:</strong> {subscription?.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h1 className="admin-title mb-2">Subscription Details: {monthName}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-[#636e72]">Select Month</label>
        <select
          value={selectedMonth?.split("-")[1]}
          onChange={handleMonthChange}
          className="admin-native-select"
        >
          {months.slice(0, currentMonthIndex + 1).map((month) => (
            <option key={month.value} value={month.value}>
              {month.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="admin-card p-4 text-[#d63031]">{error}</div>}

      {subscription && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between border-b border-[#dfe6e9] py-3 text-[#2d3436]">
                <span>Plan</span>
                <span>{subscription.plan_name || subscription.flat_type || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-[#dfe6e9] py-3 text-[#2d3436]">
                <span>Total Amount</span>
                <span className="font-bold">₹{Number(subscription.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-[#dfe6e9] py-3">
                <span className="text-[#2d3436]">Status</span>
                <Badge className={subscription.status?.toLowerCase() === "paid" ? "admin-badge-paid" : "admin-badge-pending"}>
                  {subscription.status}
                </Badge>
              </div>
              <div className="flex justify-between border-b border-[#dfe6e9] py-3 text-[#2d3436]">
                <span>Payment Date</span>
                <span>{subscription.status?.toLowerCase() === "paid" && subscription.payment_date ? new Date(subscription.payment_date).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex justify-between border-b border-[#dfe6e9] py-3 text-[#2d3436]">
                <span>Transaction ID</span>
                <span className="font-mono text-sm">{subscription.status?.toLowerCase() === "paid" ? subscription.transaction_id : "-"}</span>
              </div>
              <div className="flex justify-between py-3 text-[#2d3436]">
                <span>Payment Mode</span>
                <span>{subscription.status?.toLowerCase() === "paid" ? subscription.payment_mode : "-"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-[#2d3436]">Charges Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="admin-table-wrap">
                <table className="w-full text-[#2d3436]">
                  <tbody>
                    {breakdown.map((item) => (
                      <tr key={item.name} className="border-b border-[#dfe6e9]">
                        <td className="p-3">{item.name}</td>
                        <td className="p-3 text-right">₹{Number(item.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-right font-bold text-[#2d3436]">
                Total: ₹{Number(totalAmount).toFixed(2)}
              </div>

              <div className="mt-6">
                {subscription.status?.toLowerCase() === "paid" ? (
                  <Button className="admin-btn-secondary w-full rounded-xl py-3" onClick={handleDownloadReceipt}>
                    Download Receipt
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="admin-btn-ghost w-full rounded-xl py-3"
                    onClick={() =>
                      router.push(`/user/payments?month=${subscription.month}&year=${subscription.year}`)
                    }
                  >
                    Pay Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
