"use client";

import { useEffect } from "react";
import axios from "axios";
export default function OneSignalProvider() {

  useEffect(() => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async (OneSignal) => {

      if (window.OneSignalInitialized) {
        return;
      }

      window.OneSignalInitialized = true;

      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
      });

      // Request permission
      const permission = OneSignal.Notifications.permission;

      if (permission === "default") {
        await OneSignal.Slidedown.promptPush();
      }
   
      OneSignal.User.PushSubscription.addEventListener("change", async (event) => {
        const playerId = event.current?.id;
        if (playerId) {
          await registerDevice(playerId);
        }

      });

      const playerId = OneSignal.User.PushSubscription.id;

      if (playerId) {
        await registerDevice(playerId);
      }

      OneSignal.Notifications.addEventListener(
        "foregroundWillDisplay",
        (event) => {

          const notification = event.notification;

          event.preventDefault();

          notification.display();

          window.dispatchEvent(
            new CustomEvent("notification-received", {
              detail: {
                title: notification.title,
                message: notification.body,
              },
            })
          );
        }
      );

      OneSignal.Notifications.addEventListener("click", (event) => {
        console.log("Notification clicked:", event);
      });

    });

    async function registerDevice(playerId) {
      const token = localStorage.getItem("token");
      if (!token || !playerId) {
        return;
      }

      try {

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/register-device`,
          { player_id: playerId },
          {
            withCredentials: true, 
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );
      } catch (err) {

        console.error("Device register error:", err.response?.data || err.message);
      }

    }

  }, []);

  return null;

}