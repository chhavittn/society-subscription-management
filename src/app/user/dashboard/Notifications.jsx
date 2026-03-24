"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Bell, Check, Trash2, X } from "lucide-react";

export default function Notifications({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const getNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/my-notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
    }
  }, [token]);

  const markRead = async (id) => {
    if (!token) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/notification/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (error) {
      console.error("Error marking notification read:", error.response?.data || error.message);
    }
  };

  const deleteNotification = async (id) => {
    if (!token) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/notification/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (!token) return;

    const timer = setTimeout(() => {
      getNotifications();
    }, 0);

    const handleNotification = (event) => {
      const { title, message } = event.detail || {};

      setNotifications((prev) => [
        {
          id: Date.now(),
          title: title || "New Notification",
          message: message || "",
          is_read: false,
        },
        ...prev,
      ]);

      setTimeout(() => {
        getNotifications();
      }, 1000);
    };

    window.addEventListener("notification-received", handleNotification);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("notification-received", handleNotification);
    };
  }, [getNotifications, token]);

  useEffect(() => {
    if (!token) return;

    const handleFocus = () => {
      getNotifications();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [getNotifications, token]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dfe6e9] bg-white/80 text-[#2d3436] transition hover:bg-white"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#fdcb6e] px-1 text-[10px] font-semibold text-[#2d3436]">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="admin-card absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[24px]">
          <div className="flex items-center justify-between border-b border-[#dfe6e9] bg-white/75 px-4 py-3">
            <h3 className="text-sm font-semibold text-[#2d3436]">Notifications</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe6e9] bg-white text-[#636e72] transition hover:bg-[#f4faf9] hover:text-[#2d3436]"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-4 text-sm text-[#636e72]">No notifications</p>
            )}

            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-b border-[#dfe6e9] p-4 transition ${
                  notification.is_read ? "bg-white/70" : "bg-[#e8fffb]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-[#2d3436]">
                      {notification.title}
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-[#636e72]">
                      {notification.message}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => markRead(notification.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#00b894] text-white"
                        aria-label="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#d63031] text-white"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
