import ReportsSummary from "./ReportsSummary"
import { PaymentModeChart, RevenueOverTimeChart } from "./PaymentModeChart"
import DownloadButtons from "./DownloadButtons"

export default function ReportsPage() {
  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        Financial Reports
      </h1>

      <ReportsSummary />
      <PaymentModeChart />
      <RevenueOverTimeChart />

      <DownloadButtons />

    </div>
  )
}