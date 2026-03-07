import ReportsSummary from "./ReportsSummary"
import PaymentModeChart from "./PaymentModeChart"
import DownloadButtons from "./DownloadButtons"

export default function ReportsPage() {
  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        Financial Reports
      </h1>

      <ReportsSummary />

      <PaymentModeChart />

      <DownloadButtons />

    </div>
  )
}