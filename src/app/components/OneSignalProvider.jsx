"use client";

import { useEffect } from "react";

export default function OneSignalProvider() {
  useEffect(() => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async (OneSignal) => {
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
      });

      OneSignal.Slidedown.promptPush();

      const subscriptionId = OneSignal.User.PushSubscription.id;
      console.log("Subscription ID:", subscriptionId);
      
      if (!subscriptionId) {
        OneSignal.User.PushSubscription.addEventListener("change", async (event) => {
          const newId = event.current.id;
          if (newId) {
            await registerDevice(newId);
          }
        });
        return;
      }

      await registerDevice(subscriptionId);

      // Notification listeners
      OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
        console.log("Notification received:", event);

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            runId: 'ui-pre-fix',
            hypothesisId: 'H5',
            location: 'src/app/components/OneSignalProvider.jsx:33',
            message: 'OneSignal foregroundWillDisplay fired, dispatching window notification-received',
            data: {
              notificationTitle: event.notification?.title || null
            },
            timestamp: Date.now()
          })
        }).catch(() => { });
        // #endregion

        window.dispatchEvent(new Event("notification-received"));
      });

      OneSignal.Notifications.addEventListener("click", (event) => {
        console.log("Notification clicked:", event);
      });
    });

    async function registerDevice(playerId) {
      const token = localStorage.getItem("token");
      if (token && playerId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register-device`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ player_id: playerId }),
        });
      }
    }
  }, []);

  return null;
}
