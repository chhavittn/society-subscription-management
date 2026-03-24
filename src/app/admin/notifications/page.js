"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [flatType, setFlatType] = useState("");
  const [flatId, setFlatId] = useState("");
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/flats?limit=1000`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          }
        );

        setFlats(data.flats || []);
      } catch (error) {
        console.error("Failed to load flats for notifications:", error);
      }
    };

    fetchFlats();
  }, []);

  const handleSend = async () => {
    if (!title || !message) {
      toast.error("Please fill all fields");
      return;
    }

    if (targetType === "flat" && !flatType) {
      toast.error("Please select a flat type");
      return;
    }

    if (targetType === "single_flat" && !flatId) {
      toast.error("Please select a flat");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        message,
        target_type: targetType,
        flat_type: targetType === "flat" ? flatType : null,
        flat_id: targetType === "single_flat" ? Number(flatId) : null,
      };

      await axios.post(
        "http://localhost:5000/api/v1/admin/send-notification",
        payload,
        { withCredentials: true }
      );

      toast.success("Notification sent successfully");

      setTitle("");
      setMessage("");
      setTargetType("all");
      setFlatType("");
      setFlatId("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-centered flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="admin-title mb-2">
            Send Notifications
          </h1>
        </div>

        <div className="admin-card p-6 space-y-5">

          <input
            type="text"
            placeholder="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="admin-input w-full"
          />

          <textarea
            placeholder="Notification Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            className="admin-textarea w-full"
          />

          <select
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value);
              setFlatType("");
              setFlatId("");
            }}
            className="admin-native-select w-full"
          >
            <option value="all">All Users</option>
            <option value="flat">Flat Type</option>
            <option value="single_flat">Particular Flat</option>
          </select>

          {targetType === "flat" && (
            <select
              value={flatType}
              onChange={(e) => setFlatType(e.target.value)}
              className="admin-native-select w-full"
            >
              <option value="">Select Flat Type</option>
              <option value="1BHK">1BHK</option>
              <option value="2BHK">2BHK</option>
              <option value="3BHK">3BHK</option>
              <option value="4BHK">4BHK</option>
            </select>
          )}

          {targetType === "single_flat" && (
            <select
              value={flatId}
              onChange={(e) => setFlatId(e.target.value)}
              className="admin-native-select w-full"
            >
              <option value="">Select Flat</option>
              {flats.map((flat) => (
                <option key={flat.id} value={flat.id}>
                  {flat.flat_number} {flat.block ? `(${flat.block})` : ""} {flat.user_name ? `- ${flat.user_name}` : ""}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleSend}
            disabled={loading}
            className="admin-btn-primary w-full rounded-xl py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>

        </div>

      </div>

    </div>
  );
}
