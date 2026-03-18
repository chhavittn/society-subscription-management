"use client";

import { useEffect } from "react";
import axios from "axios";
export default function OneSignalProvider() {

  useEffect(() => {

    console.log(" OneSignalProvider mounted");

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async (OneSignal) => {

      console.log("🔵 OneSignal script loaded");
      if (window.OneSignalInitialized) {
        console.log("⚠️ OneSignal already initialized");
        return;
      }

      window.OneSignalInitialized = true;

      console.log("🔵 Initializing OneSignal");

      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
      });

      console.log("✅ OneSignal initialized");

      // Request permission
      const permission = OneSignal.Notifications.permission;

      console.log("🔐 Notification permission:", permission);

      if (permission === "default") {
        console.log("📢 Showing permission prompt");
        await OneSignal.Slidedown.promptPush();
      }

      if (permission === "granted") {
        console.log("✅ Permission already granted");
      }

      // Listen for subscription change
      OneSignal.User.PushSubscription.addEventListener("change", async (event) => {

        console.log("🔄 Subscription changed:", event);

        const playerId = event.current?.id;

        if (playerId) {
          console.log("🆔 Player ID received:", playerId);
          await registerDevice(playerId);
        }

      });

      // Check existing subscription
      const playerId = OneSignal.User.PushSubscription.id;

      console.log("🔎 Existing Player ID:", playerId);

      if (playerId) {
        await registerDevice(playerId);
      }

      // Foreground notification listener
      // OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {

      //   console.log("🔔 Notification received in foreground:", event);

      //   // Trigger dashboard refresh
      //   window.dispatchEvent(new Event("notification-received"));

      // });

      OneSignal.Notifications.addEventListener(
        "foregroundWillDisplay",
        (event) => {

          console.log("🔥 Foreground notification received", event);

          const notification = event.notification;

          // 🔥 IMPORTANT (without this, event may not behave properly)
          event.preventDefault();

          // Show notification manually
          notification.display();

          // ✅ Send to React
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


      // Notification click
      OneSignal.Notifications.addEventListener("click", (event) => {

        console.log("🖱 Notification clicked:", event);

      });

    });

    async function registerDevice(playerId) {

      const token = localStorage.getItem("token");

      console.log("📡 Register device called", { playerId, token });

      if (!token || !playerId) {
        console.log("⚠️ Missing token or playerId");
        return;
      }

      try {

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/register-device`,
          { player_id: playerId },
          {
            withCredentials: true, // IMPORTANT
            headers: {
              Authorization: `Bearer ${token}`, // optional if backend supports it
            },
          }
        );

        console.log("✅ Device registered:", data);

      } catch (err) {

        console.error("❌ Device register error:", err.response?.data || err.message);


      }

    }

  }, []);

  return null;

}