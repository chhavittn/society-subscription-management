"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsSummary() {

  const stats = [
    { title: "Total Collection", value: "₹4,50,000" },
    { title: "Pending Payments", value: "₹38,000" },
    { title: "Total Paid Flats", value: "95" },
    { title: "Pending Flats", value: "25" }
  ]

  return (
    <div className="grid md:grid-cols-4 gap-6">

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