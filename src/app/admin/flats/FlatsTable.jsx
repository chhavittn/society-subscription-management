"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import FlatFormModal from "./FlatFormModal"

export default function FlatsTable() {

  const [flats, setFlats] = useState([
    {
      id: 1,
      flatNumber: "A-101",
      owner: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210"
    },
    {
      id: 2,
      flatNumber: "B-204",
      owner: "Priya Singh",
      email: "priya@gmail.com",
      phone: "9998887776"
    },
    {
      id: 1,
      flatNumber: "A-101",
      owner: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210"
    },
    {
      id: 2,
      flatNumber: "B-204",
      owner: "Priya Singh",
      email: "priya@gmail.com",
      phone: "9998887776"
    }, {
      id: 1,
      flatNumber: "A-101",
      owner: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210"
    },
    {
      id: 2,
      flatNumber: "B-204",
      owner: "Priya Singh",
      email: "priya@gmail.com",
      phone: "9998887776"
    }, {
      id: 1,
      flatNumber: "A-101",
      owner: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210"
    },
    {
      id: 2,
      flatNumber: "B-204",
      owner: "Priya Singh",
      email: "priya@gmail.com",
      phone: "9998887776"
    }, {
      id: 1,
      flatNumber: "A-101",
      owner: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210"
    },
    {
      id: 2,
      flatNumber: "B-204",
      owner: "Priya Singh",
      email: "priya@gmail.com",
      phone: "9998887776"
    }, {
      id: 1,
      flatNumber: "A-101",
      owner: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210"
    },
    {
      id: 2,
      flatNumber: "B-204",
      owner: "Priya Singh",
      email: "priya@gmail.com",
      phone: "9998887776"
    }, {
      id: 1,
      flatNumber: "A-101",
      owner: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210"
    },
    {
      id: 2,
      flatNumber: "B-204",
      owner: "Priya Singh",
      email: "priya@gmail.com",
      phone: "9998887776"
    }, {
      id: 1,
      flatNumber: "A-101",
      owner: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210"
    },
    {
      id: 2,
      flatNumber: "B-204",
      owner: "Priya Singh",
      email: "priya@gmail.com",
      phone: "9998887776"
    }, {
      id: 1,
      flatNumber: "A-101",
      owner: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210"
    },
    {
      id: 2,
      flatNumber: "B-204",
      owner: "Priya Singh",
      email: "priya@gmail.com",
      phone: "9998887776"
    }, {
      id: 1,
      flatNumber: "A-101",
      owner: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210"
    },
    {
      id: 2,
      flatNumber: "B-204",
      owner: "Priya Singh",
      email: "priya@gmail.com",
      phone: "9998887776"
    },
  ])

  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filteredFlats = flats.filter(flat =>
    flat.owner.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredFlats.length / rowsPerPage)

  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedFlats = filteredFlats.slice(
    startIndex,
    startIndex + rowsPerPage
  )

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center">

        <input
          placeholder="Search owner..."
          className="border p-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FlatFormModal />

      </div>

      <div className="border rounded-lg overflow-hidden">

        <div className="max-h-[500px] overflow-y-auto overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Flat</th>
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedFlats.map(flat => (
                <tr key={flat.id} className="border-t">

                  <td className="p-3">{flat.flatNumber}</td>
                  <td className="p-3">{flat.owner}</td>
                  <td className="p-3">{flat.email}</td>
                  <td className="p-3">{flat.phone}</td>

                  <td className="p-3 space-x-2">
                    <Button size="sm">Edit</Button>
                    <Button size="sm" variant="destructive">Delete</Button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

      {/* Pagination */}

      <div className="flex justify-between items-center">

        <div className="flex items-center gap-2">
          <span>Rows:</span>
          <select
            className="border rounded p-1"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2">

          <Button
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </Button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <Button
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>

        </div>

      </div>

    </div>
  )
}