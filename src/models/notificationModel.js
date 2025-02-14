const prisma = require("./prismaClient");

//  Function to Create a Notification
module.exports.createNotification = async (userId, title, message) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                user_id: userId,
                title: title,
                message: message,
                status: "unseen", // Default status
            }
        });
        console.log(`🔔 Notification sent to User ${userId}: ${title}`);
        return notification;
    } catch (error) {
        console.error("⚠️ Error creating notification:", error);
        throw error;
    }
};

//  Function to Mark Notification as Seen
module.exports.markNotificationAsSeen = async (userId, notificationId) => {
    try {
        await prisma.notification.update({
            where: { id: notificationId, user_id: userId },
            data: { status: "seen" }
        });
        // console.log(` Notification ${notificationId} marked as seen for User ${userId}`);
    } catch (error) {
        console.error("⚠️ Error marking notification as seen:", error);
        throw error;
    }
};

//  Function to Get Notifications for a User
module.exports.getUserNotifications = async (userId) => {
    try {
        return await prisma.notification.findMany({
            where: { 
                user_id: userId,
                status: "unseen" //  Fetch only unseen notifications
            },
            orderBy: { created_at: "desc" }, //  Sort by newest first
        });
    } catch (error) {
        console.error("⚠️ Error fetching unseen notifications:", error);
        throw error;
    }
};


// Function to Get Unseen Notifications Count
module.exports.getUnseenCount = async (userId) => {
    try {
        const count = await prisma.notification.count({
            where: { user_id: userId, status: "unseen" }
        });
        return count;
    } catch (error) {
        console.error("⚠️ Error fetching unseen notification count:", error);
        throw error;
    }
};

module.exports.checkAndNotifyDueRentals = async () => {
    try {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        // Fetch rentals that are due today or tomorrow and haven't been returned
        const dueRentals = await prisma.rent_history.findMany({
            where: {
                return_date: null, // Not returned yet
                end_date: {
                    gte: today, // Greater than or equal to today
                    lte: tomorrow, // Less than or equal to tomorrow
                },
            },
            include: {
                users: true, // Include user details for notifications
                book: true, // Include book details
            },
        });

        if (dueRentals.length === 0) {
            console.log("✅ No due books today or tomorrow.");
            return;
        }

        // Create notifications for users with due books
        const notifications = dueRentals.map((rental) => ({
            user_id: rental.users.id,
            title: "Book Return Reminder",
            message: rental.end_date.toDateString() === today.toDateString()
                ? `📢 Your book "${rental.book.book_name}" is due today. Please return it on time.`
                : `📢 Your book "${rental.book.book_name}" is due tomorrow. Kindly prepare for the return.`,
            status: "unseen",
            created_at: new Date(),
        }));

        // Bulk insert notifications into the database
        await prisma.notification.createMany({ data: notifications });

        console.log(`🔔 Sent ${notifications.length} due date notifications.`);
    } catch (error) {
        console.error("⚠️ Error processing due date notifications:", error);
        throw error;
    }
};

