"use client"
import { useState, useEffect } from "react"
import axios from "axios"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

export default function PaymentEntryForm() {
  const [flats, setFlats] = useState([])
  const [selectedFlatId, setSelectedFlatId] = useState("")
  const [flatType, setFlatType] = useState("")

  const [planName, setPlanName] = useState("") // auto-filled
  const [planId, setPlanId] = useState(null)   // store plan_id
  const [amount, setAmount] = useState("")

  const [month, setMonth] = useState("")
  const currentYear = new Date().getFullYear()
  const [method, setMethod] = useState("")
  const [loading, setLoading] = useState(false)

  // Fetch flats
  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.log("❌ No token found, please login first")
          return
        }

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/flats`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        )
        setFlats(data.flats || [])
      } catch (err) {
        console.log("Error fetching flats", err.response?.data || err)
      }
    }
    fetchFlats()
  }, [])

  // When flat is selected, fetch plan by flat_type
  useEffect(() => {
    if (!selectedFlatId || flats.length === 0) return

    const flat = flats.find(f => f.id === Number(selectedFlatId))
    if (!flat) return

    setFlatType(flat.flat_type)

    const token = localStorage.getItem("token")
    if (!token) {
      console.log("❌ No token found, please login first")
      return
    }

    const fetchPlan = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/plan/${flat.flat_type}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        )

        if (data.success && data.plan) {
          setPlanName(data.plan.plan_name)  // auto-fill plan name
          setAmount(data.plan.amount)       // auto-fill amount
          setPlanId(data.plan.id)           // ✅ store plan_id for payload
        }
      } catch (err) {
        console.log("Error fetching plan for flat type:", err.response?.data || err)
        setPlanName("")
        setAmount("")
        setPlanId(null)
      }
    }

    fetchPlan()
  }, [selectedFlatId, flats])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFlatId || !planId || !month || !method) {
      alert("Please fill all fields")
      return
    }

    const payload = {
      flat_id: Number(selectedFlatId),
      plan_id: Number(planId),       // ✅ send correct plan_id
      month: Number(month),
      year: currentYear,
      payment_mode: method
    }

    setLoading(true)
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/pay`,
        payload,
        { withCredentials: true }
      )
      alert("Payment successful ✅")
      setSelectedFlatId("")
      setPlanName("")
      setPlanId(null)
      setAmount("")
      setMonth("")
      setMethod("")
    } catch (err) {
      console.log("Payment error:", err.response?.data || err)
      alert(err.response?.data?.message || "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Flat ID */}
          <Select value={selectedFlatId} onValueChange={setSelectedFlatId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Flat" />
            </SelectTrigger>
            <SelectContent>
              {flats.map(flat => (
                <SelectItem key={flat.id} value={String(flat.id)}>
                  {flat.flat_number} ({flat.block})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Auto-filled Plan Name */}
          <Input value={planName} readOnly placeholder="Plan (BHK)" />

          {/* Auto-filled Monthly Rate */}
          <Input value={amount} readOnly placeholder="Monthly Rate" />

          {/* Month */}
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment Method */}
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Record Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}