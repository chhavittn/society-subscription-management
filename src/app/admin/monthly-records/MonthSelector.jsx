"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function MonthlyRecordsTable() {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  const [month, setMonth] = useState(currentMonth);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${month}`,
        { withCredentials: true }
      );

      const filtered = (data.subscriptions || []).filter(r => r.user_id);

      const allFlats = filtered.map(r => ({
        ...r,
        status: r.status || "pending",
        subscription_id: r.subscription_id || r.id || 0,
      }));

      setRecords(allFlats);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    const filtered = records.filter(r =>
      r.user_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      r.flat_number?.toString().includes(debouncedSearch)
    );

    setFilteredRecords(filtered);
  }, [records, debouncedSearch]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredRecords.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const markAsPaid = async (record) => {
    const toastId = toast.loading("Marking payment as paid...");

    try {
      const [year, monthNum] = month.split("-");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/mark-paid`,
        {
          subscription_id: record.subscription_id || undefined,
          flat_id: record.flat_id,
          plan_id: record.plan_id || 1,
          amount: record.amount || 2200,
          month: Number(monthNum),
          year: Number(year),
          due_date: record.due_date || `${year}-${monthNum}-10`,
        },
        { withCredentials: true }
      );

      record.subscription_id =
        res.data?.subscription?.id || record.subscription_id;

      setRecords(prev =>
        prev.map(r =>
          r.flat_id === record.flat_id
            ? { ...r, status: "paid", subscription_id: record.subscription_id }
            : r
        )
      );
      toast.success("Payment marked as paid", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to mark payment as paid", {
        id: toastId,
      });
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.trim().toLowerCase();
    if (s === "paid")
      return <Badge className="admin-badge-paid">Paid</Badge>;
    if (s === "overdue")
      return <Badge className="admin-badge-overdue">Overdue</Badge>;
    return <Badge className="admin-badge-pending">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="admin-select-trigger w-60">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent className="admin-select-content">
            {Array.from({ length: 12 }, (_, i) => {
              const m = String(i + 1).padStart(2, "0");
              return (
                <SelectItem key={m} value={`${today.getFullYear()}-${m}`}>
                  {new Date(today.getFullYear(), i).toLocaleString("default", {
                    month: "long"
                  })}{" "}
                  {today.getFullYear()}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <input
          placeholder="Search flat / owner..."
          className="admin-input w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p className="text-[#2d3436]">Loading records...</p>}

      {!loading && filteredRecords.length > 0 && (
        <div className="admin-table-wrap">
          <div className="max-h-[500px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head sticky top-0">
                <tr className="admin-table-head-row">
                  <th className="p-3 text-left">Flat</th>
                  <th className="p-3 text-left">Owner</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((record, index) => {
                  const status = record.status?.toLowerCase();

                  return (
                    <tr
                      key={record.flat_id}
                      className={`border-t border-[#dfe6e9] ${
                        index % 2 === 0 ? "admin-row-even" : "admin-row-odd"
                      } admin-row-hover`}
                    >
                      <td className="p-3 text-[#2d3436]">
                        {record.flat_number} ({record.block})
                      </td>
                      <td className="p-3 text-[#636e72]">{record.user_name}</td>
                      <td className="p-3">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="p-3">
                        {["pending", "overdue"].includes(status) && (
                          <Button
                            size="sm"
                            className="admin-btn-primary"
                            onClick={() => markAsPaid(record)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {!loading && filteredRecords.length === 0 && (
        <p className="text-[#636e72]">No records found</p>
      )}

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#2d3436]">Rows:</span>
          <select
            className="admin-native-select px-2 py-1"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
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
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="admin-btn-warm"
          >
            Prev
          </Button>

          <span className="text-[#2d3436]">
            Page {currentPage} of {totalPages || 1}
          </span>

          <Button
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="admin-btn-warm"
          >
            Next
          </Button>
        </div>

      </div>

    </div>
  );
}
