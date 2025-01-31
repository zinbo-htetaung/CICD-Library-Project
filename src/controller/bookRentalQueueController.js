const model = require("../models/bookRentalQueueModel.js");
module.exports.retrieveQueueById = async (req, res, next) => {
    try {
        let userId = res.locals.user_id;
        const queue = await model.retrieveByUserId(userId);

        // Check if the queue is empty
        if (!queue || queue.length === 0) {
            return res.status(404).json({ message: "Currently, user hasn't queued for any book!" });
        }

        // Respond with the retrieved data
        return res.status(200).json({ queue });
    } catch (error) {
        // Log the error for debugging
        console.error("Error in retrieveAllBooks controller:", error);

        // Return an internal server error response
        return res.status(500).json({
            error: "Failed to retrieve rental queue",
            details: error.message
        });
    }
};