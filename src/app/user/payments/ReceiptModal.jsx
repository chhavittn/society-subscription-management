"use client"

export default function Receipt({ amount }) {

  const date = new Date().toLocaleDateString()

  return (

    <div className="text-center space-y-4">

      <h2 className="text-2xl font-bold text-green-600">
        Payment Successful
      </h2>

      <p>
        Receipt Generated
      </p>

      <div className="border p-4 rounded">

        <p>
          Amount Paid: ₹{amount}
        </p>

        <p>
          Date: {date}
        </p>

        <p>
          Status: Paid
        </p>

      </div>

    </div>

  )
}