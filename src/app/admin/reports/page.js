import ReportsSummary from "./ReportsSummary"
import { PaymentModeChart, RevenueOverTimeChart } from "./PaymentModeChart"
import DownloadButtons from "./DownloadButtons"

export default function ReportsPage() {
  return (
    <div className="admin-page space-y-8">
      <div>
        <h1 className="admin-title mb-2">
          Financial Reports
        </h1>
      </div>

      <div className="admin-surface space-y-8">
        <ReportsSummary />
        <PaymentModeChart />
        <DownloadButtons />
      </div>

    </div>
  )
}
