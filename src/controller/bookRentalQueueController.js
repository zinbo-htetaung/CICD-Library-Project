const model = require("../models/bookRentalQueueModel.js");

module.exports.createQueueEntry = async (req, res, next) => {
    try {
        let userId = res.locals.user_id;
        let book_id = parseInt(req.body.bookId); // Extract book_id from request body

        if (!book_id) {
            return res.status(400).json({ message: "Book ID is required to join the queue." });
        }

        const queueEntry = await model.createQueueEntry(userId, book_id);
        
        return res.status(201).json({ message: "Queue entry created successfully.", queue: queueEntry });
    } catch (error) {
        console.error("Error in createQueueEntry controller:", error.message);

        // Preserve and send the actual error message from the model
        return res.status(400).json({ message: error.message });
    }
};

module.exports.retrieveQueueByUserId = async (req, res, next) => {
    try {
        let userId = res.locals.user_id;
        // let userId = parseInt(req.params.id); // Get user_id from URL params
        const queue = await model.retrieveQueueByUserId(userId);

        if (!queue || queue.length === 0) {
            return res.status(404).json({ message: "Currently, user hasn't queued for any book!" });
        }

        return res.status(200).json({ queue });
    } catch (error) {
        console.error("Error in retrieveQueueByUserId controller:", error);

        return res.status(500).json({
            error: "Failed to retrieve queue records",
            details: error.message,
        });
    }
};

module.exports.removeQueueByUserIdAndQueueId = async (req, res, next) => {
    try {
        let userId = req.body.user_id;
        let queue_id  = req.body.queue_id; // Get queue_id from URL params
        console.log("queue_id", queue_id );
        console.log("userId", userId);
        if (!queue_id) {
            return res.status(400).json({ message: "Queue ID is required to remove a queue entry." });
        }

        const result = await model.removeQueueByUserIdAndQueueId(parseInt(userId), parseInt(queue_id));

        return res.status(200).json({ message: result.message });
    } catch (error) {
        console.error("Error in removeQueueByUserIdAndQueueId controller:", error);

        return res.status(500).json({
            error: "Failed to remove queue entry",
            details: error.message,
        });
    }
};

module.exports.retrieveQueueByBookId = async (req, res, next) => {
    try {
        console.log("queue");
        let bookId = parseInt(req.params.book_id); // Get book_id from URL params

        if (!bookId) {
            return res.status(400).json({ message: "Book ID is required to fetch the queue." });
        }

        const queue = await model.retrieveQueueByBookId(bookId);

        if (!queue || queue.length === 0) {
            return res.status(404).json({ message: "No queue records found for this book." });
        }
        console.log(queue);
        console.log("queue");
        return res.status(200).json({ queue });
    } catch (error) {
        console.error("Error in retrieveQueueByBookId controller:", error);

        return res.status(500).json({
            error: "Failed to retrieve queue records for the book",
            details: error.message,
        });
    }
};


module.exports.getAllQueues = async (req, res, next) => {
    try {
        const status = req.body.status || ""; // Default to empty (no filtering)
        const bookTitle = req.body.bookTitle || "";
        const userName = req.body.userName || "";
        const sortBy = req.body.sortBy || "created_at"; // Default sorting field
        const sortOrder = req.body.sortOrder === "desc" ? "desc" : "asc"; // Default ascending

        console.log("Filters applied:", { status, bookTitle, userName, sortBy, sortOrder });

        const activeQueues = await model.getAllQueues(status, bookTitle, userName, sortBy, sortOrder);

        if (!activeQueues || activeQueues.length === 0) {
            return res.status(404).json({ message: "No queue entries found." });
        }

        return res.status(200).json({ queues: activeQueues });
    } catch (error) {
        console.error("Error in getAllQueues controller:", error.message);
        return res.status(500).json({
            error: "Failed to retrieve active queues",
            details: error.message,
        });
    }
};


module.exports.getMostQueuedBooks = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5; // Default to 10 books
        const mostQueuedBooks = await model.getMostQueuedBooks(limit);
        console.log("limit", limit);
        return res.status(200).json({ mostQueuedBooks });
    } catch (error) {
        console.error("Error in getMostQueuedBooks controller:", error.message);
        return res.status(500).json({
            error: "Failed to retrieve most queued books",
            details: error.message,
        });
    }
};

module.exports.getMostQueuedGenre = async (req, res, next) => {
    try {
        const mostQueuedGenre = await model.getMostQueuedGenre();

        return res.status(200).json({ mostQueuedGenre });
    } catch (error) {
        console.error("Error in getMostQueuedGenreByInterval controller:", error.message);
        return res.status(500).json({
            error: "Failed to retrieve most queued genre by interval",
            details: error.message,
        });
    }
};


module.exports.getQueueTrendsOverTime = async (req, res) => {
    try {
        const interval = req.query.interval || "month"; // Default to monthly trends
        console.log("Fetching queue trends over time for:", interval);

        const queueTrends = await model.getQueueTrendsOverTime(interval);

        if (!queueTrends || queueTrends.length === 0) {
            return res.status(404).json({ message: "No queue trend data available." });
        }

        return res.status(200).json({ queueTrends });
    } catch (error) {
        console.error("Error in getQueueTrendsOverTime controller:", error.message);
        return res.status(500).json({
            error: "Failed to retrieve queue trends over time",
            details: error.message
        });
    }
};
