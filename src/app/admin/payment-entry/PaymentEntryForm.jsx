"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function PaymentEntryForm() {
  const [flats, setFlats] = useState([]);
  const [selectedFlatId, setSelectedFlatId] = useState("");
  const [planName, setPlanName] = useState("");
  const [planId, setPlanId] = useState(null);
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const currentYear = new Date().getFullYear();
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/flats?limit=1000`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );

        setFlats(data.flats || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFlats();
  }, []);

  useEffect(() => {
    if (!selectedFlatId || flats.length === 0) return;

    const flat = flats.find(f => f.id === Number(selectedFlatId));
    if (!flat) return;

    const token = localStorage.getItem("token");

    const fetchPlan = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/plan/${flat.flat_type}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );

        if (data.success && data.plan) {
          setPlanName(data.plan.plan_name);
          setAmount(data.plan.amount);
          setPlanId(data.plan.id);
        }
      } catch (err) {
        setPlanName("");
        setAmount("");
        setPlanId(null);
      }
    };

    fetchPlan();
  }, [selectedFlatId, flats]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFlatId || !planId || !month || !method) {
      toast.error("Fill all fields");
      return;
    }

    const payload = {
      flat_id: Number(selectedFlatId),
      plan_id: Number(planId),
      month: Number(month),
      year: currentYear,
      payment_mode: method
    };

    setLoading(true);
    const toastId = toast.loading("Recording payment...");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/pay`,
        payload,
        { withCredentials: true }
      );

      toast.success("Payment successful", { id: toastId });

      setSelectedFlatId("");
      setPlanName("");
      setPlanId(null);
      setAmount("");
      setMonth("");
      setMethod("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="admin-card max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-[#2d3436] text-xl">
          Record Payment
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedFlatId} onValueChange={setSelectedFlatId}>
              <SelectTrigger className="admin-select-trigger">
                <SelectValue placeholder="Select Flat" />
              </SelectTrigger>
              <SelectContent className="admin-select-content">
                {flats.map(flat => (
                  <SelectItem key={flat.id} value={String(flat.id)}>
                    {flat.flat_number} ({flat.block})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={planName}
              readOnly
              placeholder="Plan"
              className="admin-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={amount}
              readOnly
              placeholder="Monthly Rate"
              className="admin-input"
            />

            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="admin-select-trigger">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent className="admin-select-content">
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long"
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="admin-select-trigger">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent className="admin-select-content">
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="admin-btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Processing..." : "Record Payment"}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
