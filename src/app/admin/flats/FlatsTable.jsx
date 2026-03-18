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
  const [totalPages, setTotalPages] = useState(1)
  const [editingFlat, setEditingFlat] = useState(null)

  const fetchFlats = async (page = currentPage, limit = rowsPerPage, searchTerm = search) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/v1/flats", {
        withCredentials: true, 
        headers: {
          Authorization: `Bearer ${token}`,  
        },
        params: {
          page,
          limit,
          search: searchTerm,
        },
      })

      setFlats(res.data.flats || [])
      setCurrentPage(res.data.page || page)
      setRowsPerPage(res.data.limit || limit)
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      console.log(error)
      alert(error.response?.data?.message || "Failed to load flats")
    } finally {
      setLoading(false)
    }
  }

  // Fetch flats from backend whenever pagination or search changes
  useEffect(() => {
    fetchFlats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage, search])

  // Delete a flat
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this flat?")) return
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/v1/admin/flat/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      // After delete, if current page might be empty, try to stay on a sensible page
      await fetchFlats()
      if (flats.length === 1 && currentPage > 1) {
        // We just deleted the last item on this page; go back one page
        setCurrentPage(prev => prev - 1)
      } else {
        alert("Flat deleted successfully")
      }
    } catch (error) {
      console.log(error)
      alert(error.response?.data?.message || "Failed to delete flat")
    }
  }

  const handleFlatCreatedOrUpdated = async () => {
    // Refetch current page so row stays in place according to backend sort
    await fetchFlats()
    setEditingFlat(null)
  }

  if (loading) return <p>Loading flats...</p>

  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex justify-between items-center">
        <input
          placeholder="Search owner..."
          className="border p-2 rounded w-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
        />
        <FlatFormModal mode="add" onCreated={handleFlatCreatedOrUpdated} />
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
              {flats.map(flat => (
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
          mode="edit"
          existingFlat={editingFlat}
          onUpdated={handleFlatCreatedOrUpdated}
          onClose={() => setEditingFlat(null)}
        />
      )}
    </div>
  )
}