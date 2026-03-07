"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MonthlyRecordsTable() {

  const [records,setRecords] = useState([
    {
      id:1,
      flat:"A-101",
      owner:"Rahul Sharma",
      status:"paid"
    },
    {
      id:2,
      flat:"A-102",
      owner:"Priya Singh",
      status:"pending"
    },
    {
      id:3,
      flat:"B-201",
      owner:"Amit Kumar",
      status:"pending"
    }
  ])

  const markAsPaid = (id) => {

    const updated = records.map(record => {
      if(record.id === id){
        return {...record,status:"paid"}
      }
      return record
    })

    setRecords(updated)
  }

  return (

    <table className="w-full border rounded">

      <thead className="bg-gray-100">

        <tr>
          <th className="p-3 text-left">Flat</th>
          <th className="p-3 text-left">Owner</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Action</th>
        </tr>

      </thead>

      <tbody>

        {records.map(record => (

          <tr key={record.id} className="border-t">

            <td className="p-3">{record.flat}</td>

            <td className="p-3">{record.owner}</td>

            <td className="p-3">

              {record.status === "paid" ? (
                <Badge>Paid</Badge>
              ) : (
                <Badge variant="destructive">
                  Pending
                </Badge>
              )}

            </td>

            <td className="p-3">

              {record.status === "pending" && (

                <Button
                  size="sm"
                  onClick={()=>markAsPaid(record.id)}
                >
                  Mark Paid
                </Button>

              )}

            </td>

          </tr>

        ))}

      </tbody>

    </table>
  )
}