"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CircleAlert, CreditCard, Loader2, Wallet } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  const [flat, setFlat] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentDate = new Date();
  const currentMonthNumber = currentDate.getMonth() + 1;
  const currentYearNumber = currentDate.getFullYear();
  const currentMonth = `${currentDate.getFullYear()}-${String(
    currentMonthNumber
  ).padStart(2, "0")}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const flatRes = await axios.get("http://localhost:5000/api/v1/my-flats", {
          withCredentials: true,
        });

        if (flatRes.data.success && flatRes.data.flats.length > 0) {
          setFlat(flatRes.data.flats[0]);
        } else {
          setError("No flat assigned");
          setLoading(false);
          return;
        }

        const userFlat = flatRes.data.flats[0];
        const [subRes, payRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/v1/subscriptions/${currentMonth}`, {
            withCredentials: true,
          }),
          axios.get("http://localhost:5000/api/v1/my-payments", {
            withCredentials: true,
          }),
        ]);

        if (subRes.data.success && subRes.data.subscriptions.length > 0) {
          setSubscription({ ...subRes.data.subscriptions[0], ...userFlat });
        } else {
          setSubscription({
            subscription_id: 0,
            month: currentMonthNumber,
            year: currentYearNumber,
            amount: 0,
            status: "pending",
            payment_mode: null,
            transaction_id: null,
            ...userFlat,
          });
        }

        setPayments(payRes.data.success ? payRes.data.payments : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, currentMonthNumber, currentYearNumber]);

  if (loading) {
    return (
      <div className="admin-page flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0984e3]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-card flex items-center gap-3 p-6 text-[#d63031]">
          <CircleAlert className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!subscription || !flat) {
    return <div className="admin-page text-[#2d3436]">No subscription found for this month.</div>;
  }

  const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const pendingAmount = subscription.status !== "paid" ? Number(subscription.amount || 0) : 0;
  const progress =
    subscription.status === "paid"
      ? 100
      : Number(subscription.amount)
        ? Math.min(100, (totalPaid / Number(subscription.amount)) * 100)
        : 0;

  const recentPayments = payments.slice(0, 5);

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="admin-title mb-2">Resident Dashboard</h1>
        </div>

      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base text-[#636e72]">Current Plan</CardTitle>
            <Wallet className="h-5 w-5 text-[#00cec9]" />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xl font-semibold text-[#2d3436]">{subscription.plan_name || "Maintenance"}</p>
            <Badge className={subscription.status === "paid" ? "admin-badge-paid" : "admin-badge-pending"}>
              {subscription.status || "Pending"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base text-[#636e72]">Pending Amount</CardTitle>
            <CircleAlert className="h-5 w-5 text-[#e17055]" />
          </CardHeader>
          <CardContent>
            <p className="stat-value text-[#d63031]">₹{pendingAmount.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base text-[#636e72]">Total Paid</CardTitle>
            <CreditCard className="h-5 w-5 text-[#0984e3]" />
          </CardHeader>
          <CardContent>
            <p className="stat-value text-[#00b894]">₹{totalPaid.toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>

        <div className="admin-card grid gap-3 px-5 py-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f8fcfb] px-4 py-3">
            <p className="stat-label">Flat No.</p>
            <p className="mt-1 text-lg font-semibold text-[#2d3436]">{flat.flat_number}</p>
          </div>
          <div className="rounded-2xl bg-[#f8fcfb] px-4 py-3">
            <p className="stat-label">Block</p>
            <p className="mt-1 text-lg font-semibold text-[#2d3436]">{flat.block || "N/A"}</p>
          </div>
          <div className="rounded-2xl bg-[#f8fcfb] px-4 py-3">
            <p className="stat-label">Owner</p>
            <p className="mt-1 text-lg font-semibold text-[#2d3436]">{flat.user_name}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-[#2d3436]">Maintenance Payment Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Progress value={progress} className="h-3 rounded-full bg-[#dfe6e9]" />
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#636e72]">
              <span>Month: {currentMonth}</span>
              <span>{subscription.status === "paid" ? "Paid in full" : "Payment pending"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-[#2d3436]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="admin-btn-primary w-full justify-between rounded-xl px-4 py-3" onClick={() => router.push("/user/subscriptions")}>
              View Subscriptions
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button className="admin-btn-secondary w-full justify-between rounded-xl px-4 py-3" onClick={() => router.push("/user/payments")}>
              Payment History
              <ArrowRight className="h-4 w-4" />
            </Button>
            {pendingAmount > 0 && (
              <Button
                className="admin-btn-warm w-full justify-between rounded-xl px-4 py-3"
                onClick={() => router.push(`/user/payments?month=${subscription.month}&year=${subscription.year}`)}
              >
                Pay Current Due
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-[#2d3436]">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-[#636e72]">No recent payments available yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="w-full text-sm">
                <thead className="admin-table-head">
                  <tr className="admin-table-head-row">
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Mode</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment, index) => (
                    <tr
                      key={payment.id}
                      className={`border-t border-[#dfe6e9] ${index % 2 === 0 ? "admin-row-even" : "admin-row-odd"
                        } admin-row-hover`}
                    >
                      <td className="px-4 py-3 text-[#2d3436]">₹{payment.amount}</td>
                      <td className="px-4 py-3 text-[#636e72]">{payment.payment_mode}</td>
                      <td className="px-4 py-3 text-[#636e72]">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
