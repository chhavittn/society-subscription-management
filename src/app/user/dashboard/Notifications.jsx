"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"

export default function Notifications() {

  const notifications = [
    "Maintenance payment due on 10th March",
    "Water supply maintenance scheduled tomorrow",
    "Community meeting this Sunday"
  ]

  return (
    <Card>

      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        {notifications.map((note, index) => (
          <p
            key={index}
            className="text-sm border-b pb-2"
          >
            {note}
          </p>
        ))}

      </CardContent>

    </Card>
  )
}