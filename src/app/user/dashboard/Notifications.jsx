"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const getNotifications = async () => {
    if (!token) return; 
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: 'ui-pre-fix',
          hypothesisId: 'H6',
          location: 'src/app/user/dashboard/Notifications.jsx:13',
          message: 'getNotifications called in Notifications component',
          data: {},
          timestamp: Date.now()
        })
      }).catch(() => { });
      // #endregion

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

  useEffect(() => {
    getNotifications();
    const handleNotification = () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: 'ui-pre-fix',
          hypothesisId: 'H7',
          location: 'src/app/user/dashboard/Notifications.jsx:43',
          message: 'window notification-received event handler triggered, calling getNotifications',
          data: {},
          timestamp: Date.now()
        })
      }).catch(() => { });
      // #endregion

      getNotifications();
    };
    window.addEventListener("notification-received", handleNotification);
    return () => window.removeEventListener("notification-received", handleNotification);
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
  {notifications.map(n => (
    <div
      key={n.id}
      className={`p-4 border-b cursor-pointer ${n.is_read ? "bg-gray-800" : "bg-gray-700"} text-white`}
      onClick={() => markRead(n.id)}
    >
      <h4 className="font-semibold">{n.title}</h4>
      <p className="text-sm">{n.message}</p>
    </div>
  ))}
</div>
      )}
    </div>
  );
}