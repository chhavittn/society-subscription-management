"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import SubscriptionTable from "./SubscriptionTable";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/v1/my-subscriptions", {
          withCredentials: true,
        });

        if (data.success) {
          setSubscriptions(data.subscriptions);
        }
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  return (
    <div className="admin-page">
      <div>
        <h1 className="admin-title mb-2">Monthly subscription status</h1>
      </div>

      <Card className="admin-card">
        <CardContent className="p-6">
          {loading ? (
            <p className="py-6 text-center text-[#636e72]">Loading subscriptions...</p>
          ) : subscriptions.length === 0 ? (
            <p className="py-6 text-center text-[#636e72]">No subscriptions found.</p>
          ) : (
            <SubscriptionTable subscriptions={subscriptions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
