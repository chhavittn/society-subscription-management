import SubscriptionTable from "./SubscriptionTable"

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Subscription Plans
      </h1>

      <p className="text-gray-500">
        Manage monthly maintenance charges based on flat type.
      </p>

      <SubscriptionTable />

    </div>
  )
}