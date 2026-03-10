import PaymentCard from "./PaymentCard"

export default function PayNowPage() {

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <h1 className="text-3xl font-bold">
        Pay Maintenance Subscription
      </h1>

      <PaymentCard />

    </div>
  )
}