const model = require("../models/rentHistory.js");

module.exports.retrieveRentHistory = async (req, res, next) => {
    try {
        // Extract filters from the request query parameters
        const filters = {
            userId: req.query.userId,
            userName: req.query.userName,
            userEmail: req.query.userEmail,
            userAddress: req.query.userAddress,
            userDob: req.query.userDob,
            bookId: req.query.bookId,
            bookName: req.query.bookName,
            author: req.query.author,
            bookDescription: req.query.bookDescription,
            minNoOfCopies: req.query.minNoOfCopies,
            maxNoOfCopies: req.query.maxNoOfCopies,
            minAvailableCopies: req.query.minAvailableCopies,
            maxAvailableCopies: req.query.maxAvailableCopies,
            minRentalDate: req.query.minRentalDate,
            maxRentalDate: req.query.maxRentalDate,
            minEndDate: req.query.minEndDate,
            maxEndDate: req.query.maxEndDate,
            minReturnDate: req.query.minReturnDate,
            maxReturnDate: req.query.maxReturnDate,
            dueStatus: req.query.dueStatus,
            minDueFees: req.query.minDueFees,
            maxDueFees: req.query.maxDueFees,
            sortOrder: req.query.sortOrder,
            page: parseInt(req.query.page, 10) || 1, // Default to page 1
            limit: parseInt(req.query.limit, 10) || 10 // Default limit is 10 items per page
        };

        // Fetch rental history data from the model with filters
        const rentHistory = await model.retrieveAll(filters);

        // Check if the history is empty
        if (!rentHistory || rentHistory.length === 0) {
            return res.status(404).json({ message: "No rental history found" });
        }

        // Calculate pagination details
        const totalItems = rentHistory.length;
        const totalPages = Math.ceil(totalItems / filters.limit);
        const currentPage = filters.page;

        // Paginate data
        const start = (currentPage - 1) * filters.limit;
        const paginatedData = rentHistory.slice(start, start + filters.limit);

        // Respond with the retrieved data
        return res.status(200).json({
            message: "Rental history retrieved successfully",
            data: paginatedData,
            pagination: {
                totalItems,
                totalPages,
                currentPage,
                itemsPerPage: filters.limit
            }
        });
    } catch (error) {
        // Log the error for debugging
        console.error("Error in retrieveRentHistory controller:", error);

        // Return an internal server error response
        return res.status(500).json({
            error: "Failed to retrieve rental history",
            details: error.message
        });
    }
};

module.exports.retrieveRentHistoryById = async (req, res, next) => {
    try {
        res.locals.user_id = 1;
        let userId = res.locals.user_id;
        const history = await model.retrieveByUserId(userId);

        // Check if the history is empty
        if (!history || history.length === 0) {
            return res.status(404).json({ message: "Currently have no rented books...yet!" });
        }

        // Respond with the retrieved data
        return res.status(200).json({ history });
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