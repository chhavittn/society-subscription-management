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
  DialogFooter,
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
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to load flats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500); // delay (ms)

    return () => clearTimeout(timer);
  }, [search]);


  useEffect(() => {
    fetchFlats(currentPage, rowsPerPage, debouncedSearch);
  }, [currentPage, rowsPerPage, debouncedSearch, sortBy, sortOrder]);



  // Delete a flat
  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting flat...");

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/v1/admin/flat/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 👇 Check BEFORE fetching
      const isLastItemOnPage = flats.length === 1 && currentPage > 1;

      if (isLastItemOnPage) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchFlats();
      }

      toast.success("Flat deleted successfully", { id: toastId });

    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to delete flat",
        { id: toastId }
      );
    }
    finally {
      setDeleteId(null);
    }
  };

  const handleFlatCreatedOrUpdated = async () => {
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
          }}
        />
        <FlatFormModal mode="add" onCreated={handleFlatCreatedOrUpdated} />
      </div>
      {/* Sort Field */}
      <div>
        <select
          className="border p-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="flat_number">Flat</option>
          <option value="user_name">Owner</option>
        </select>

        {/* Sort Order Button */}
        <Button
          variant="outline"
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
        >
          {sortOrder === "asc" ? "⬆️ Asc" : "⬇️ Desc"}
        </Button>
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
                    <Button size="sm" onClick={() => setEditingFlat(flat)}>Edit</Button><Button
                      size="sm"
                      variant="destructive"
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
      {
        editingFlat && (
          <FlatFormModal
            mode="edit"
            existingFlat={editingFlat}
            onUpdated={handleFlatCreatedOrUpdated}
            onClose={() => setEditingFlat(null)}
          />
        )
      }
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="w-full max-w-md rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600">
              Delete Flat?
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}