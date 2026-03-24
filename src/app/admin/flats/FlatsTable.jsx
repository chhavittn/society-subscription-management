"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import FlatFormModal from "./FlatFormModal"
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FlatsTable() {
  const [flats, setFlats] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [editingFlat, setEditingFlat] = useState(null)
  const [deleteId, setDeleteId] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("flat_number");
  const [sortOrder, setSortOrder] = useState("asc");

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
          sortBy,
          sortOrder,
        },
      })

      setFlats(res.data.flats || [])
      setCurrentPage(res.data.page || page)
      setRowsPerPage(res.data.limit || limit)
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load flats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchFlats(currentPage, rowsPerPage, debouncedSearch);
  }, [currentPage, rowsPerPage, debouncedSearch, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting flat...");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/v1/admin/flat/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      const isLastItemOnPage = flats.length === 1 && currentPage > 1;

      if (isLastItemOnPage) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchFlats();
      }

      toast.success("Flat deleted successfully", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete flat", { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const handleFlatCreatedOrUpdated = async () => {
    await fetchFlats()
    setEditingFlat(null)
  }

  if (loading) return <p className="text-[#2d3436]">Loading flats...</p>

  return (
    <div className="admin-surface space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <input
          placeholder="Search owner..."
          className="admin-input w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FlatFormModal mode="add" onCreated={handleFlatCreatedOrUpdated} />
      </div>

      <div className="flex items-center gap-3">
        <select
          className="admin-native-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="flat_number">Flat</option>
          <option value="user_name">Name</option>
        </select>

        <Button
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="admin-btn-warm"
        >
          {sortOrder === "asc" ? "⬆️ Asc" : "⬇️ Desc"}
        </Button>
      </div>

      <div className="admin-table-wrap">
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="admin-table-head sticky top-0 z-10">
              <tr className="admin-table-head-row">
                <th className="p-3 text-left">Flat</th>
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {flats.map((flat, index) => (
                <tr
                  key={flat.id}
                  className={`border-t border-[#dfe6e9] ${
                    index % 2 === 0 ? "admin-row-even" : "admin-row-odd"
                  } admin-row-hover transition`}
                >
                  <td className="p-3 font-medium text-[#2d3436]">{flat.flat_number}</td>
                  <td className="p-3 text-[#636e72]">{flat.user_name || "Unassigned"}</td>
                  <td className="p-3 text-[#636e72]">{flat.user_email || "-"}</td>
                  <td className="p-3 text-[#636e72]">{flat.user_phone || "-"}</td>
                  <td className="p-3 space-x-2">
                    <Button
                      size="sm"
                      className="admin-btn-primary"
                      onClick={() => setEditingFlat(flat)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="admin-btn-danger"
                      onClick={() => setDeleteId(flat.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#2d3436]">Rows:</span>
          <select
            className="admin-native-select px-2 py-1"
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

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            disabled={currentPage === 1}
            className="admin-btn-warm"
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </Button>

          <span className="text-[#2d3436]">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            size="sm"
            disabled={currentPage === totalPages}
            className="admin-btn-warm"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {editingFlat && (
        <FlatFormModal
          mode="edit"
          existingFlat={editingFlat}
          onUpdated={handleFlatCreatedOrUpdated}
          onClose={() => setEditingFlat(null)}
        />
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="admin-modal w-full max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#d63031]">
              Delete Flat?
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              className="admin-btn-ghost"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              className="admin-btn-danger"
              onClick={() => handleDelete(deleteId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
