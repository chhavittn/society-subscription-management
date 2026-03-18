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

  // 🔹 Flat details
  const [flatNumber, setFlatNumber] = useState("")
  const [block, setBlock] = useState("")
  const [floor, setFloor] = useState("")
  const [flatType, setFlatType] = useState("")

  // 🔹 Plan + amount
  const [plans, setPlans] = useState([])
  const [planId, setPlanId] = useState("")
  const [amount, setAmount] = useState("")

  // 🔹 Other fields
  const [month, setMonth] = useState("")
  const currentYear = new Date().getFullYear()
  const [method, setMethod] = useState("")
  const [loading, setLoading] = useState(false)

  // ✅ Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/plans`,
          { withCredentials: true }
        )
        setPlans(data.plans)
      } catch (err) {
        console.log("Error fetching plans", err)
      }
    }

    fetchPlans()
  }, [])

  // ✅ Auto-fill amount when plan changes
  useEffect(() => {
    const selected = plans.find(p => p.id === Number(planId))
    if (selected) {
      setAmount(selected.amount)
    }
  }, [planId, plans])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 🚨 Validate month first
    if (!month) {
      alert("Please select a month")
      return
    }



    const payload = {
      flatNumber,
      block,
      floor,
      flatType,
      plan_id: Number(planId),
      month: Number(month), // ✅ directly number
      year: currentYear,
      payment_mode: method
    }

    console.log("📤 Payload:", payload)

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/pay",
        payload,
        { withCredentials: true }
      )

      alert("Payment successful ✅")
      setFlatNumber("")
      setBlock("")
      setFloor("")
      setFlatType("")
      setPlanId("")
      setMonth("")
      setMethod("")
      setAmount("")

    } catch (error) {
      console.log("❌ Error:", error.response?.data)
      alert(error.response?.data?.message || "Something went wrong")
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 🔹 Flat Details */}
          <Input placeholder="Flat Number" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} />
          <Input placeholder="Block" value={block} onChange={(e) => setBlock(e.target.value)} />
          <Input placeholder="Floor" value={floor} onChange={(e) => setFloor(e.target.value)} />
          <Input placeholder="Flat Type" value={flatType} onChange={(e) => setFlatType(e.target.value)} />

          {/* 🔹 Plan */}
          <Select value={planId} onValueChange={setPlanId} placeholder="Select Plan">
            <SelectTrigger className="bg-white text-black border border-gray-300">
              <SelectValue placeholder="Select Plan" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              sideOffset={5}
              className="z-[9999] bg-white border border-gray-300 shadow-lg"
            >
              {plans.map(plan => (
                <SelectItem
                  key={plan.id}
                  value={String(plan.id)}
                  className="text-black hover:bg-gray-100"
                >
                  {plan.plan_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* 🔹 Auto amount */}
          <Input value={amount} readOnly placeholder="Amount (auto-filled)" />

          {/* 🔹 Month */}
          <Select onValueChange={setMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="1">January</SelectItem>
              <SelectItem value="2">February</SelectItem>
              <SelectItem value="3">March</SelectItem>
              <SelectItem value="4">April</SelectItem>
              <SelectItem value="5">May</SelectItem>
              <SelectItem value="6">June</SelectItem>
              <SelectItem value="7">July</SelectItem>
              <SelectItem value="8">August</SelectItem>
              <SelectItem value="9">September</SelectItem>
              <SelectItem value="10">October</SelectItem>
              <SelectItem value="11">November</SelectItem>
              <SelectItem value="12">December</SelectItem>
            </SelectContent>
          </Select>
          {/* 🔹 Payment method */}
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