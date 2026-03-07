import PaymentEntryForm from "./PaymentEntryForm"

export default function PaymentEntryPage() {
  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Manual Payment Entry
      </h1>

      <p className="text-gray-500">
        Record offline payments made via cash or UPI.
      </p>

      <PaymentEntryForm />

    </div>
  )
}