"use client"
import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"

export default function PaymentEntryForm() {    
  const [flat,setFlat] = useState("")
  const [month,setMonth] = useState("")
  const [method,setMethod] = useState("")
  const [amount,setAmount] = useState("")
  const [note,setNote] = useState("")

  const handleSubmit = (e) => {

    e.preventDefault()

    console.log({
      flat,
      month,
      method,
      amount,
      note
    })
    alert("Payment recorded successfully")
  }

  return (

    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Record Payment</CardTitle>
      </CardHeader>
      <CardContent>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <Select onValueChange={setFlat}>
            <SelectTrigger>
              <SelectValue placeholder="Select Flat" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="A101">A101</SelectItem>
              <SelectItem value="A102">A102</SelectItem>
              <SelectItem value="B201">B201</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="month"
            value={month}
            onChange={(e)=>setMonth(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e)=>setAmount(e.target.value)}
          />

          <Select onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full">
            Record Payment
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}