import MonthlyRecordsTable from "./MonthlyRecordsTable"
import MonthSelector from "./MonthSelector"
export default function MonthlyRecordsPage() {
    return (
        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                Monthly Subscription Records
            </h1>
            <MonthSelector />

            <MonthlyRecordsTable />

        </div>
    )
}