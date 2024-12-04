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
        res.locals.user_id=1;
        let userId = res.locals.user_id;
        const history = await model.retrieveByUserId(userId);

        // Check if the history is empty
        if (!history || history.length === 0) {
            return res.status(404).json({ message: "Currently have no rented books...yet!" });
        }

        // Respond with the retrieved data
        return res.status(200).json({history});
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

module.exports.extendBookRental = async (req, res, next) => {
    const { historyId } = req.params;
    const userId = res.locals.user_id; 

    try {
        const result = await model.extendBookRental(historyId, userId);

        return res.status(200).json({
            message: 'Book rental successfully extended by 3 days.',
            rentHistory: result,
        });

    } catch (error) {
        if (error.type === 'NotFound') {
            return res.status(404).json({ message: error.message });
        }
        if (error.type === 'InvalidRequest') {
            return res.status(400).json({ message: error.message });
        }

        console.error('Error in extending rent history:', error);
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}