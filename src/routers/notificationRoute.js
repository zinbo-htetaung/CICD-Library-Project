const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");

//  Send a new notification (Trigger this after an action)
router.post("/send", notificationController.sendNotification);

//  Check and notify due rentals
router.get("/:userId/check-rent-due", notificationController.checkAndNotifyDueRentals);

//  Get all notifications for a user
router.get("/:userId", notificationController.getUserNotifications);

//  Mark a notification as seen
router.post("/:userId/mark-seen", notificationController.markAsSeen);

//  Get unseen notifications count for the user
router.get("/:userId/unseen-count", notificationController.getUnseenCount);

module.exports = router;
