"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"

export default function ReceiptPage() {
  const { id } = useParams()
  const router = useRouter()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const receiptRef = useRef(null)

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/v1/my-subscription/${id}`,
          { withCredentials: true }
        )
        if (data.success) setSubscription(data.subscription)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    fetchReceipt()
  }, [id])

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: subscription ? `receipt-${subscription.id}` : "receipt",
  })

  if (loading) return <p>Loading receipt...</p>
  if (!subscription) return <p>Receipt not found</p>

  // If subscription is pending, redirect to payment page
  if (subscription.status?.toLowerCase() === "pending") {
    router.push(`/pay/${subscription.id}`)
    return null
  }

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      <div
        ref={receiptRef}
        className="border p-6 rounded shadow space-y-4 bg-white text-black"
      >
        <h1 className="text-xl font-bold text-center">Subscription Receipt</h1>

        <div className="space-y-1">
          <p><strong>Name:</strong> {subscription.user_name}</p>
          <p><strong>Email:</strong> {subscription.user_email}</p>
          <p><strong>Flat:</strong> {subscription.flat_number}</p>
        </div>

        <div className="space-y-1">
          <p><strong>Plan:</strong> {subscription.plan_name || "N/A"}</p>
          <p><strong>Month:</strong> {subscription.month} / {subscription.year}</p>
          <p><strong>Amount:</strong> ₹{Number(subscription.amount).toFixed(2)}</p>
          <p><strong>Status:</strong> {subscription.status}</p>
        </div>

        {subscription.status?.toLowerCase() === "paid" && (
          <div className="space-y-1">
            <p><strong>Payment Mode:</strong> {subscription.payment_mode || "-"}</p>
            <p><strong>Transaction ID:</strong> {subscription.transaction_id || "-"}</p>
            <p>
              <strong>Payment Date:</strong>{" "}
              {subscription.payment_date
                ? new Date(subscription.payment_date).toLocaleDateString()
                : "-"}
            </p>
          </div>
        )}

        <p className="text-center mt-4">Thank you for your payment!</p>
      </div>

      <Button onClick={handlePrint}>Download / Print PDF</Button>
    </div>
  )
}