"use client";

import { useRouter, useParams } from "next/navigation";

export default function SubscriptionDetails() {
    const router = useRouter();
    const params = useParams();
    const month = params.month;

    const handleMonthChange = (e) => {
        router.push(`/subscriptions/${e.target.value}`);
    };

    const data = {
        month: month,
        total: 2500,
        status: "Paid",
        paymentMode: "UPI",
        paymentDate: "2026-03-02",
        breakdown: [
            { name: "Maintenance", amount: 1500 },
            { name: "Security", amount: 500 },
            { name: "Water", amount: 300 },
            { name: "Electricity Backup", amount: 200 },
        ],
    };

    return (
        <div className="p-6 space-y-6">

            <h1 className="text-2xl font-bold">
                Subscription Details for {month}
            </h1>

            <div>
                <label className="block mb-2 font-medium">Select Month</label>
                <select
                    value={month}
                    onChange={handleMonthChange}
                    className="border p-2 rounded"
                >
                    <option value="2026-01">January 2026</option>
                    <option value="2026-02">February 2026</option>
                    <option value="2026-03">March 2026</option>
                </select>
            </div>

            {/* Payment Summary */}
            <div className="border rounded p-4">
                <h2 className="font-semibold text-lg mb-2">
                    Payment Summary
                </h2>

                <p><strong>Total Amount:</strong> ₹{data.total}</p>
                <p><strong>Status:</strong> {data.status}</p>
                <p><strong>Payment Mode:</strong> {data.paymentMode}</p>
                <p><strong>Payment Date:</strong> {data.paymentDate}</p>
            </div>

            {/* Charges Breakdown */}
            <div className="border rounded p-4">
                <h2 className="font-semibold text-lg mb-3">
                    Charges Breakdown
                </h2>

                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">Charge</th>
                            <th className="p-2 border">Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.breakdown.map((item, index) => (
                            <tr key={index}>
                                <td className="p-2 border">{item.name}</td>
                                <td className="p-2 border">₹{item.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Receipt Button */}
            <button className="bg-black text-white px-4 py-2 rounded">
                Download Receipt
            </button>

        </div>
    );
}