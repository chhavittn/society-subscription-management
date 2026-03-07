"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StatsCards() {

  const stats = [
    { title: "Total Flats", value: 120 },
    { title: "Total Money Collected", value: "₹4,20,000" },
    { title: "Pending Payments", value: "₹35,000" },
    { title: "Monthly Collection", value: "₹1,10,000" }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

      {stats.map((stat, index) => (
        <Card key={index}>

          <CardHeader>
            <CardTitle className="text-sm text-gray-500">
              {stat.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              {stat.value}
            </p>
          </CardContent>

        </Card>
      ))}

    </div>
  )
}