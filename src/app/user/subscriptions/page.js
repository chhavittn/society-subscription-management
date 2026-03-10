import SubscriptionTable from "./SubscriptionTable"

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Monthly Subscription Status
      </h1>

      <SubscriptionTable />

    </div>
  )
}