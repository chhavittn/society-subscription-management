"use client";

import { useEffect } from "react";

export default function OneSignalProvider() {

  useEffect(() => {

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function (OneSignal) {

      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true
      });

      const playerId = await OneSignal.User.PushSubscription.id;

      console.log("Player ID:", playerId);

      if (!playerId) return;

      const token = localStorage.getItem("token");

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/register-device`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          player_id: playerId
        })
      });

    });

  }, []);

  return null;
}