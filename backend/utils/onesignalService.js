const axios = require("axios");

exports.sendNotification = async (playerIds, title, message) => {

    if (!playerIds.length) return;
    try {
        await axios.post(
            "https://onesignal.com/api/v1/notifications",
            {
                app_id: process.env.ONESIGNAL_APP_ID,
                include_player_ids: playerIds,
                headings: { en: title },
                contents: { en: message }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
                }
            }
        );

    } catch (error) {

        console.log("ONESIGNAL ERROR:", error.response?.data || error.message);

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                runId: 'pre-fix',
                hypothesisId: 'H1',
                location: 'backend/utils/onesignalService.js:25',
                message: 'OneSignal API error when sending notification',
                data: {
                    error: error.response?.data || error.message,
                    playerIdsSample: playerIds.slice(0, 5),
                    playerIdsCount: playerIds.length
                },
                timestamp: Date.now()
            })
        }).catch(() => {});
        // #endregion

    }
};