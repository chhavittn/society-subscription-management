"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const data = [
  { name: "UPI", value: 250000 },
  { name: "Bank Transfer", value: 120000 },
  { name: "Cash", value: 80000 }
]

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"]

export default function PaymentModeChart() {

  return (
    <Card>

      <CardHeader>
        <CardTitle>
          Payment Mode Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent>

        <div className="h-[300px]">

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>

        </div>

      </CardContent>

    </Card>
  )
}