"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

export default function MonthSelector({month,setMonth}){

  return(

    <Select value={month} onValueChange={setMonth}>

      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select Month" />
      </SelectTrigger>

      <SelectContent>

        <SelectItem value="jan">January</SelectItem>
        <SelectItem value="feb">February</SelectItem>
        <SelectItem value="mar">March</SelectItem>
        <SelectItem value="apr">April</SelectItem>

      </SelectContent>

    </Select>

  )
}