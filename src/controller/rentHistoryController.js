const model = require("../models/rentHistory.js");

module.exports.retrieveRentHistory = async (req, res, next) => {
    try {
        // Fetch rental history data from the model
        const history = await model.retrieveAll();

        // Check if the history is empty
        if (!history || history.length === 0) {
            return res.status(404).json({ message: "No rental history found" });
        }

        // Respond with the retrieved data
        return res.status(200).json({
            message: "Rental history retrieved successfully",
            history
        });
    } catch (error) {
        // Log the error for debugging
        console.error("Error in retrieveAllBooks controller:", error);

        // Return an internal server error response
        return res.status(500).json({
            error: "Failed to retrieve rental history",
            details: error.message
        });
    }
};

module.exports.retrieveRentHistoryById = async (req, res, next) => {
    try {
        let userId = res.locals.user_id;
        const history = await model.retrieveByUserId(userId);

        // Check if the history is empty
        if (!history || history.length === 0) {
            return res.status(404).json({ message: "No rental history found" });
        }

        // Respond with the retrieved data
        return res.status(200).json({
            message: "Rental history retrieved successfully",
            history
        });
    } catch (error) {
        // Log the error for debugging
        console.error("Error in retrieveAllBooks controller:", error);

        // Return an internal server error response
        return res.status(500).json({
            error: "Failed to retrieve rental history",
            details: error.message
        });
    }
};