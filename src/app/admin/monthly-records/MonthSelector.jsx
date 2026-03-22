// "use client";

// import { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// export default function MonthlyRecordsTable() {
//   const today = new Date();
//   const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
//   const [month, setMonth] = useState(currentMonth);
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // 🔹 Fetch records
//   const fetchRecords = useCallback(async () => {
//     if (!month) return;
//     try {
//       setLoading(true);
//       const { data } = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${month}`,
//         { withCredentials: true }
//       );
//       setRecords(data.subscriptions || []);
//     } catch (err) {
//       console.error("Error fetching subscriptions:", err);
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [month]);

//   useEffect(() => {
//     fetchRecords();
//   }, [fetchRecords]);

//   // 🔹 Mark as paid (create if missing)
//   const markAsPaid = async (record) => {
//     try {
//       const [year, monthNum] = month.split("-");

//       if (!record.subscription_id || record.subscription_id === 0) {
//         const res = await axios.post(
//           `${process.env.NEXT_PUBLIC_API_URL}/admin/subscription`,
//           {
//             flat_id: record.flat_id,
//             plan_id: record.plan_id || 1,
//             amount: record.amount || 2200,
//             month: Number(monthNum),
//             year: Number(year),
//             due_date: record.due_date,
//             status: "paid"
//           },
//           { withCredentials: true }
//         );
//         record.subscription_id = res.data.subscription.id;
//       } else {
//         await axios.put(
//           `${process.env.NEXT_PUBLIC_API_URL}/admin/subscription/${record.subscription_id}`,
//           { status: "paid" },
//           { withCredentials: true }
//         );
//       }

//       setRecords(prev =>
//         prev.map(r => r.flat_id === record.flat_id ? { ...r, status: "paid", subscription_id: record.subscription_id } : r)
//       );
//     } catch (err) {
//       console.error("Failed to mark paid:", err);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const s = status?.trim().toLowerCase();
//     if (s === "paid") return <Badge>Paid</Badge>;
//     if (s === "overdue") return <Badge variant="destructive">Overdue</Badge>;
//     return <Badge variant="secondary">Pending</Badge>;
//   };

//   return (
//     <div className="space-y-6">
//       <Select value={month} onValueChange={setMonth}>
//         <SelectTrigger className="w-60">
//           <SelectValue placeholder="Select Month" />
//         </SelectTrigger>
//         <SelectContent>
//           {Array.from({ length: 12 }, (_, i) => {
//             const m = String(i + 1).padStart(2, "0");
//             return (
//               <SelectItem key={m} value={`${today.getFullYear()}-${m}`}>
//                 {new Date(today.getFullYear(), i).toLocaleString("default", { month: "long" })} {today.getFullYear()}
//               </SelectItem>
//             );
//           })}
//         </SelectContent>
//       </Select>

//       {loading && <p>Loading records...</p>}
//       {!loading && records.length === 0 && <p>No records found for this month.</p>}

//       {!loading && records.length > 0 && (
//         <table className="w-full border rounded">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3 text-left">Flat</th>
//               <th className="p-3 text-left">Owner</th>
//               <th className="p-3 text-left">Status</th>
//               <th className="p-3 text-left">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {records.map(record => {
//               const status = record.status?.trim().toLowerCase();
//               return (
//                 <tr key={record.flat_id} className="border-t">
//                   <td className="p-3">{record.flat_number} ({record.block})</td>
//                   <td className="p-3">{record.user_name}</td>
//                   <td className="p-3">{getStatusBadge(record.status)}</td>
//                   <td className="p-3">
//                     {["pending", "overdue"].includes(status) && (
//                       <Button size="sm" onClick={() => markAsPaid(record)}>
//                         Mark Paid
//                       </Button>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }


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

export default function MonthlyRecordsTable() {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(currentMonth);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all flats + subscriptions for selected month
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${month}`,
        { withCredentials: true }
      );

      // Filter out flats with no user assigned
      const filtered = (data.subscriptions || []).filter(r => r.user_id);

      // Show pending by default if subscription doesn't exist
      const allFlats = filtered.map(r => ({
        ...r,
        status: r.status || "pending",
        subscription_id: r.id || 0,
      }));

      setRecords(allFlats);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // 🔹 Mark as Paid (create subscription if missing)
  const markAsPaid = async (record) => {
    try {
      const [year, monthNum] = month.split("-");

      if (!record.subscription_id || record.subscription_id === 0) {
        // Create new subscription
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/subscription`,
          {
            flat_id: record.flat_id,
            plan_id: record.plan_id || 1,
            amount: record.amount || 2200,
            month: Number(monthNum),
            year: Number(year),
            due_date: record.due_date || `${year}-${monthNum}-10`,
            status: "paid",
          },
          { withCredentials: true }
        );
        record.subscription_id = res.data.subscription.id;
      } else {
        // Update existing subscription
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/subscription/${record.subscription_id}`,
          { status: "paid" },
          { withCredentials: true }
        );
      }

      setRecords(prev =>
        prev.map(r =>
          r.flat_id === record.flat_id
            ? { ...r, status: "paid", subscription_id: record.subscription_id }
            : r
        )
      );
    } catch (err) {
      console.error("Failed to mark paid:", err);
    }
  };

  // 🔹 Status badge
  const getStatusBadge = (status) => {
    const s = status?.trim().toLowerCase();
    if (s === "paid") return <Badge>Paid</Badge>;
    if (s === "overdue") return <Badge variant="destructive">Overdue</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Month selector */}
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="w-60">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, "0");
            return (
              <SelectItem key={m} value={`${today.getFullYear()}-${m}`}>
                {new Date(today.getFullYear(), i).toLocaleString("default", { month: "long" })}{" "}
                {today.getFullYear()}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Loading */}
      {loading && <p>Loading records...</p>}
      {!loading && records.length === 0 && <p>No records found for this month.</p>}

      {/* Table */}
      {!loading && records.length > 0 && (
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
            {records.map(record => {
              const status = record.status?.trim().toLowerCase();
              return (
                <tr key={record.flat_id} className="border-t">
                  <td className="p-3">{record.flat_number} ({record.block})</td>
                  <td className="p-3">{record.user_name}</td>
                  <td className="p-3">{getStatusBadge(record.status)}</td>
                  <td className="p-3">
                    {["pending", "overdue"].includes(status) && (
                      <Button size="sm" onClick={() => markAsPaid(record)}>
                        Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}