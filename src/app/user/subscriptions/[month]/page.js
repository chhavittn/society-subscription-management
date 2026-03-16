"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function SubscriptionDetails() {
  const router = useRouter();
  const params = useParams();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // List of months
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

  // Initialize month from params, default to current month
  const selectedMonth =
    params.month ||
    `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subscription from backend
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(
          `http://localhost:5000/api/v1/my-subscriptions/${selectedMonth}`,
          { withCredentials: true }
        );

        if (data.subscription) {
          setSubscription(data.subscription);
          setError(null);
        } else {
          setSubscription(null);
          setError("No subscription found for this month.");
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 404) {
          setError("No subscription found for " + selectedMonth);
        } else if (err.response?.status === 400) {
          setError("Invalid month format. Please select a valid month.");
        } else {
          setError("Failed to load subscription details.");
        }
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [params.month]);

  // Handle dropdown change
  const handleMonthChange = (e) => {
    const monthValue = e.target.value; // "01", "02", etc.
    const newMonth = `${currentYear}-${monthValue}`;

    router.push(`/user/subscriptions/${newMonth}`);

    console.log("Selected Month:", newMonth);
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">
        Subscription Details: {months.find(m => m.value === selectedMonth?.split("-")[1])?.name}
      </h1>

      <div className="flex items-center space-x-4">
        <label className="font-medium">Select Month:</label>
        <select
          value={selectedMonth?.split("-")[1]}
          onChange={handleMonthChange}
          className="border p-2 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      ) : subscription && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium">{subscription.plan_name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-bold text-lg">₹{Number(subscription.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Status</span>
                <Badge variant={subscription.status?.toLowerCase() === "paid" ? "default" : "destructive"}>
                  {subscription.status}
                </Badge>
              </div>
              {subscription.status?.toLowerCase() === "paid" && (
                <>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Payment Mode</span>
                    <span className="font-medium">{subscription.payment_mode || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Payment Date</span>
                    <span className="font-medium">
                      {subscription.payment_date ? new Date(subscription.payment_date).toLocaleDateString() : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono text-sm">{subscription.transaction_id || "-"}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Charges Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Charges Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Charge Type</th>
                    <th className="pb-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {subscription.breakdown?.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 text-sm">{item.name}</td>
                      <td className="py-3 text-right font-medium">₹{Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td className="py-3 font-bold">Total</td>
                    <td className="py-3 text-right font-bold text-lg">₹{Number(subscription.amount).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-6">
                {subscription.status?.toLowerCase() === "paid" ? (
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/user/subscriptions/my-subscription/${subscription.id}`)}
                  >
                    View / Download Receipt
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => router.push(`/pay/${subscription.id}`)}
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