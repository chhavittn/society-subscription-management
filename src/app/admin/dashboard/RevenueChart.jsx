"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const data = [
  { month: "Jan", revenue: 30000 },
  { month: "Feb", revenue: 40000 },
  { month: "Mar", revenue: 35000 },
  { month: "Apr", revenue: 50000 },
  { month: "May", revenue: 45000 },
]

export default function RevenueChart() {

  return (
    <Card>

      <CardHeader>
        <CardTitle>
          Monthly Collection
        </CardTitle>
      </CardHeader>

      <CardContent>

        <div className="h-[300px]">

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>

              <XAxis dataKey="month" />
              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>

      </CardContent>

    </Card>
  )
}