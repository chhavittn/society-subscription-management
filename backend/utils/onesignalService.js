const axios = require("axios");

exports.sendNotification = async (playerIds, title, message) => {
console.log("playerIds", playerIds);
    if (!playerIds.length) return;
    try {
        await axios.post(
            "https://onesignal.com/api/v1/notifications",
            {
                app_id: process.env.ONESIGNAL_APP_ID,
                // include_player_ids: playerIds,
                include_subscription_ids: playerIds,
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

    }
};