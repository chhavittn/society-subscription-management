"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CurrentSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v1/my-subscriptions", {
          withCredentials: true,
        });
        if (res.data.success) setSubscription(res.data.pending);
        else setSubscription(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch subscription");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  if (loading) return <p className="py-6 text-center text-[#636e72]">Loading...</p>;
  if (error) return <p className="py-6 text-center text-[#d63031]">{error}</p>;
  if (!subscription) return <p className="py-6 text-center text-[#636e72]">No subscription found</p>;

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="text-[#2d3436]">Current Month Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-[#636e72]">Status</p>
          <Badge className={subscription.status === "paid" ? "admin-badge-paid" : "admin-badge-pending"}>
            {subscription.status || "Pending"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-medium text-[#636e72]">Pending Amount</p>
          <p className={`text-lg font-bold ${subscription.status === "paid" ? "text-[#00b894]" : "text-[#d63031]"}`}>
            ₹{subscription.status === "paid" ? 0 : subscription.amount}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
