"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function SubscriptionDetails() {
  const router = useRouter();
  const params = useParams();

  const receiptRef = useRef(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

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
    params.month ||
    `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 PRINT FUNCTION
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt_${subscription?.id}`,
  }); useEffect(() => {
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
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // ✅ NO GST (FINAL FIX)
  const breakdown = subscription
    ? [{ name: "Maintenance Charge", amount: subscription.amount }]
    : [];

  const totalAmount = subscription?.amount || 0;

  const currentMonthIndex = currentDate.getMonth(); 

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">

      {/* 🔥 HIDDEN RECEIPT */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <div ref={receiptRef}>
          <div className="p-8 max-w-md mx-auto border bg-white">
            <h2 className="text-xl font-bold text-center mb-4">
              Payment Receipt
            </h2>
            <div className="mb-4">
              <p><strong>Name:</strong> {subscription?.user_name}</p>
              <p><strong>Flat:</strong> {subscription?.flat_number}</p>
              <p><strong>Block:</strong> {subscription?.block}</p>
              <p><strong>Plan:</strong> {subscription?.plan_name}</p>
            </div>

            <div className="mb-4">
              <p><strong>Month:</strong> {subscription?.month}/{subscription?.year}</p>
              <p><strong>Amount:</strong> ₹{subscription?.amount}</p>
              <p><strong>Status:</strong> {subscription?.status}</p>
            </div>

            {subscription?.status?.toLowerCase() === "paid" && (
              <div className="mb-4">
                <p><strong>Payment Mode:</strong> {subscription?.payment_mode}</p>
                <p><strong>Transaction ID:</strong> {subscription?.transaction_id}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {subscription?.payment_date
                    ? new Date(subscription.payment_date).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            )}

            <div className="text-center mt-6">
              <p>--------------------------</p>
              <p>Thank you!</p>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <h1 className="text-3xl font-bold tracking-tight">
        Subscription Details:{" "}
        {
          months.find(
            (m) => m.value === selectedMonth?.split("-")[1]
          )?.name
        }
      </h1>

      {/* MONTH SELECT */}
      <div className="flex items-center space-x-4">
        <label className="font-medium">Select Month:</label>
        <select
          value={selectedMonth?.split("-")[1]}
          onChange={handleMonthChange}
          className="border p-2 rounded-md"
        >
          {/* {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.name}
            </option>
          ))} */}

          {months.slice(0, currentMonthIndex + 1).map((m) => (
            <option key={m.value} value={m.value}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* ERROR */}
      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border">
          {error}
        </div>
      ) : subscription && (
        <div className="grid md:grid-cols-2 gap-6">

          {/* PAYMENT SUMMARY */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="flex justify-between border-b py-2">
                <span>Plan</span>
                <span>{subscription.plan_name}</span>
              </div>

              <div className="flex justify-between border-b py-2">
                <span>Total Amount</span>
                <span className="font-bold">
                  ₹{Number(subscription.amount).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between border-b py-2">
                <span>Status</span>
                <Badge>
                  {subscription.status}
                </Badge>
              </div>

              {/* {subscription.status?.toLowerCase() === "paid" && (
                <>
                  <div className="flex justify-between border-b py-2">
                    <span>Payment Mode</span>
                    <span>{subscription.payment_mode}</span>
                  </div>

                  <div className="flex justify-between border-b py-2">
                    <span>Payment Date</span>
                    <span>
                      {subscription.payment_date
                        ? new Date(subscription.payment_date).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span>Transaction ID</span>
                    <span>{subscription.transaction_id}</span>
                  </div>
                </>
              )} */}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Payment Date</span>
                <span className="font-medium">
                  {subscription.status?.toLowerCase() === "paid" && subscription.payment_date
                    ? new Date(subscription.payment_date).toLocaleDateString()
                    : "-"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-sm">
                  {subscription.status?.toLowerCase() === "paid" ? subscription.transaction_id : "-"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Payment Mode</span>
                <span className="font-medium">
                  {subscription.status?.toLowerCase() === "paid" ? subscription.payment_mode : "-"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* BREAKDOWN */}
          <Card>
            <CardHeader>
              <CardTitle>Charges Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <tbody>
                  {breakdown.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td className="text-right">
                        ₹{Number(item.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 font-bold text-right">
                Total: ₹{Number(totalAmount).toFixed(2)}
              </div>

              <div className="mt-6">
                {subscription.status?.toLowerCase() === "paid" ? (
                  <Button className="w-full" onClick={handlePrint}>
                    Download Receipt
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/user/payments?month=${subscription.month}&year=${subscription.year}`
                      )
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
