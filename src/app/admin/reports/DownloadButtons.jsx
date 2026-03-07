"use client"

import { Button } from "@/components/ui/button"

export default function DownloadButtons() {
  return (
    <div className="flex gap-4">

      <Button>
        Download CSV
      </Button>

      <Button variant="secondary">
        Download PDF
      </Button>

    </div>
  )
}