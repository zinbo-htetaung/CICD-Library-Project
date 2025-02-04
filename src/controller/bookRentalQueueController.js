const model = require("../models/bookRentalQueueModel.js");
module.exports.createQueueEntry = async (req, res, next) => {
    try {
        let userId = res.locals.user_id;
        // let userId = parseInt(req.params.id); // Get user_id from URL params
        let book_id  = parseInt(req.body.bookId); // Extract book_id from request body
        console.log(book_id);
        if (!book_id) {
            return res.status(400).json({ message: "Book ID is required to join the queue." });
        }

        const queueEntry = await model.createQueueEntry(userId, book_id);

        return res.status(201).json({ message: "Queue entry created successfully.", queue: queueEntry });
    } catch (error) {
        console.error("Error in createQueueEntry controller:", error);

        return res.status(500).json({
            error: "Failed to create queue entry",
            details: error.message,
        });
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
        let userId = res.locals.user_id;
        let queue_id  = req.body.queueId; // Get queue_id from URL params

        if (!queue_id) {
            return res.status(400).json({ message: "Queue ID is required to remove a queue entry." });
        }

        const result = await model.removeQueueByUserIdAndQueueId(userId, parseInt(queue_id));

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
