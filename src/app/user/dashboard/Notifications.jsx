"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const getNotifications = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/my-notifications`,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, }
      );
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
    }
  };

  const markRead = async (id) => {
    if (!token) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/notification/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, }
      );
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification read:", error.response?.data || error.message);
    }
  };
  const deleteNotification = async (id) => {
    if (!token) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/notification/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // 🔥 remove from UI instantly
      setNotifications(prev => prev.filter(n => n.id !== id));

    } catch (error) {
      console.error("Error deleting notification:", error.response?.data || error.message);
    }
  };
  useEffect(() => {

    if (!token) return;

    getNotifications();

    const handleNotification = (event) => {
      console.log("📥 notification-received event triggered", event);

      const { title, message } = event.detail || {};

      setNotifications(prev => {
        const updated = [
          {
            id: Date.now(),
            title: title || "New Notification",
            message: message || "",
            is_read: false,
          },
          ...prev,
        ];

        console.log("🧠 Updated notifications:", updated);
        return updated;
      });

      setTimeout(() => {
        getNotifications();
      }, 1000);
    };

    window.addEventListener("notification-received", handleNotification);

    return () => {
      window.removeEventListener("notification-received", handleNotification);
    };

  }, [token]);

  useEffect(() => {
    if (!token) return;
    const handleFocus = () => {
      getNotifications();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [token]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-100 bg-gray-900 text-white shadow-lg rounded-md border z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="p-4 text-gray-400">No notifications</p>
          )}
          {/* {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 border-b cursor-pointer ${n.is_read ? "bg-gray-800" : "bg-gray-700"} text-white`}
              onClick={() => markRead(n.id)}
            >
              <h4 className="font-semibold">{n.title}</h4>
              <p className="text-sm">{n.message}</p>
            </div>
          ))} */}
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 border-b bg-gray-700 text-white flex justify-between items-center ${n.is_read ? "bg-gray-800" : "bg-gray-700"}`}
            >
              <div className="flex justify-between items-center w-full">
                <div>
                  <h4 className="font-semibold">{n.title}</h4>
                  <p className="text-sm">{n.message}</p>
                </div>

                <div className="flex gap-2">
                  {!n.is_read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="bg-blue-600 text-xs px-2 py-1 rounded"
                    >
                      Read
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="bg-red-600 text-xs px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}