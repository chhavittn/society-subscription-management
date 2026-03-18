"use client";

import { useState } from "react";
import axios from "axios";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("all");

  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      alert("Please fill all fields");
      return;
    }

    if (targetType === "user" && !userId) {
      alert("User ID is required");
      return;
    }

    if (targetType === "plan" && !planId) {
      alert("Plan ID is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        message,
        target_type: targetType,
        user_id: targetType === "user" ? userId : null,
        plan_id: targetType === "plan" ? planId : null,
      };

      await axios.post(
        "http://localhost:5000/api/v1/admin/send-notification",
        payload,
        { withCredentials: true }
      );

      alert("✅ Notification sent successfully");

      // reset form
      setTitle("");
      setMessage("");
      setTargetType("all");
      setUserId("");
      setPlanId("");

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">
        Send Notifications
      </h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">

        {/* Title */}
        <input
          type="text"
          placeholder="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-3 rounded"
        />

        {/* Message */}
        <textarea
          placeholder="Notification Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border p-3 rounded"
          rows="4"
        />

        {/* Target */}
        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          className="w-full border p-3 rounded"
        >
          <option value="all">All Users</option>
          <option value="user">Specific User</option>
          <option value="plan">Plan Users</option>
        </select>

        {/* Conditional Inputs */}
        {targetType === "user" && (
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border p-3 rounded"
          />
        )}

        {targetType === "plan" && (
          <input
            type="text"
            placeholder="Enter Plan ID"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full border p-3 rounded"
          />
        )}

        {/* Button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>

      </div>
    </div>
  );
}