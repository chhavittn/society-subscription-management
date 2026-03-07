"use client";

import { useState } from "react";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");

  const handleSend = () => {
    if (!title || !message) {
      alert("Please fill all fields");
      return;
    }
    const newNotification = {
      id: Date.now(),
      title,
      message,
      audience,
      date: new Date().toLocaleString(),
    };

    setHistory([newNotification, ...history]);
    setTitle("");
    setMessage("");
    setAudience("all");

    alert("Notification queued (frontend demo)");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Send Notification</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <textarea
            placeholder="Notification Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border p-3 rounded"
            rows="4"
          />

          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full border p-3 rounded"
          >
            <option value="all">All Users</option>
            <option value="2bhk">2BHK Residents</option>
            <option value="3bhk">3BHK Residents</option>
          </select>

          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
}