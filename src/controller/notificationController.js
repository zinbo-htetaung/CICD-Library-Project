const notificationModel = require("../models/notificationModel");

//  Middleware: Send Notification After an Action
module.exports.sendNotification = async (req, res, next) => {
    try {
        const { userId, title, message } = req.body;
        if (!userId || !title || !message) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const notification = await notificationModel.createNotification(userId, title, message);
        return res.status(201).json({ message: "Notification sent", notification });
    } catch (error) {
        console.error("⚠️ Error sending notification:", error);
        return res.status(500).json({ message: "Failed to send notification" });
    }
};

//  Get User Notifications
module.exports.getUserNotifications = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const notifications = await notificationModel.getUserNotifications(userId);

        return res.status(200).json({ notifications });
    } catch (error) {
        console.error("⚠️ Error fetching notifications:", error);
        return res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

//  Mark Notification as Seen
module.exports.markAsSeen = async (req, res) => {
    try {
        const { userId, notificationId } = req.body;
        await notificationModel.markNotificationAsSeen(userId, notificationId);

        return res.status(200).json({ message: "Notification marked as seen" });
    } catch (error) {
        console.error("⚠️ Error marking notification as seen:", error);
        return res.status(500).json({ message: "Failed to mark notification as seen" });
    }
};

//  Get Unseen Notification Count
module.exports.getUnseenCount = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const count = await notificationModel.getUnseenCount(userId);

        return res.status(200).json({ unseenCount: count });
    } catch (error) {
        console.error("⚠️ Error fetching unseen notification count:", error);
        return res.status(500).json({ message: "Failed to fetch unseen count" });
    }
};

module.exports.checkAndNotifyDueRentals = async (req, res) => {
    console.log("Checking and notifying due rentals...");
    try {
        await notificationModel.checkAndNotifyDueRentals();
        return res.status(200).json({ message: "Rent due notifications processed successfully." });
    } catch (error) {
        console.error("⚠️ Error in rent due notification controller:", error);
        return res.status(500).json({ message: "Failed to process rent due notifications." });
    }
};


