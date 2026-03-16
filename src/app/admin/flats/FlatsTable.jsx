"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import FlatFormModal from "./FlatFormModal"

export default function FlatsTable() {
  const [flats, setFlats] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [editingFlat, setEditingFlat] = useState(null)

  // Fetch flats from backend
  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v1/flats", {
          withCredentials: true,
        })
        setFlats(res.data.flats)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    }
    fetchFlats()
  }, [])

  // Delete a flat
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this flat?")) return
    try {
      await axios.delete(`http://localhost:5000/api/v1/admin/flat/${id}`, {
        withCredentials: true,
      })
      setFlats(prev => prev.filter(f => f.id !== id))
      alert("Flat deleted successfully")
    } catch (error) {
      console.log(error)
      alert(error.response?.data?.message || "Failed to delete flat")
    }
  }

  // Update flat in state after editing
  const handleUpdateFlat = (updatedFlat) => {
    setFlats(prev =>
      prev.map(f => (f.id === updatedFlat.id ? updatedFlat : f))
    )
    setEditingFlat(null)
  }

  // Filtering
  const filteredFlats = flats.filter(f =>
    f.user_name?.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredFlats.length / rowsPerPage))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages])

  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedFlats = filteredFlats.slice(startIndex, startIndex + rowsPerPage)

  if (loading) return <p>Loading flats...</p>

  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex justify-between items-center">
        <input
          placeholder="Search owner..."
          className="border p-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FlatFormModal setFlats={setFlats} />
      </div>

      {/* Flats Table */}
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
                  <td className="p-3">{flat.flat_number}</td>
                  <td className="p-3">{flat.user_name || "Unassigned"}</td>
                  <td className="p-3">{flat.user_email || "-"}</td>
                  <td className="p-3">{flat.user_phone || "-"}</td>
                  <td className="p-3 space-x-2">
                    <Button size="sm" onClick={() => setEditingFlat(flat)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(flat.id)}>Delete</Button>
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

          <span>Page {currentPage} of {totalPages}</span>

          <Button
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingFlat && (
        <FlatFormModal
          setFlats={handleUpdateFlat}
          existingFlat={editingFlat}
          onClose={() => setEditingFlat(null)}
        />
      )}
    </div>
  )
}