const prisma = require('./prismaClient');

module.exports.retrieveAll = async () => {
    try {
        // Fetch all rental history records with user details
        const rentHistories = await prisma.rent_history.findMany({
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Log the data for debugging
        console.log("Retrieved Rent History Records:", rentHistories);

        // Format and return the data
        return rentHistories;
    } catch (error) {
        // Log error details
        console.error("Error retrieving rent histories:", error.message);

        // Throw an error to be handled by the caller
        throw new Error("Failed to retrieve rent histories");
    }
};

module.exports.retrieveByUserId = async (userId) => {
    try {
        // Fetch rental history records for the given user_id
        const rentHistories = await prisma.rent_history.findMany({
            where: {
                user_id: userId, 
                return_date: null
            },
            include: {
                book: true, // Include all fields from the book table
            },
        });

        // Log the fetched records for debugging purposes
        console.log(`Successfully retrieved rent history records for user_id ${userId}:`, rentHistories);

        // Check if any records were found
        if (!rentHistories || rentHistories.length === 0) {
            console.warn(`No rental history records found for user_id ${userId}.`);
            return [];
        }

        // Map to return the desired fields
        return rentHistories.map((history) => ({
            history_id: history.id,
            id: history.book.id, // Book ID
            book_name: history.book.book_name, // Book Name
            author: history.book.author, // Author Name
            start_date: history.start_date, // Start Date from rent_history
            end_date: history.end_date, // End Date from rent_history
        }));
    } catch (error) {
        // Log the error details for debugging
        console.error(`Error occurred while retrieving rent histories for user_id ${userId}:`, error.message);

        // Throw a detailed error to the caller
        throw new Error(`Failed to retrieve rent histories for user_id ${userId} due to a database error.`);
    }
};

module.exports.extendBookRental = async (historyId, userId) => {
    const rentHistory = await prisma.rent_history.findUnique({
        where: { 
            id: parseInt(historyId),
            return_date: null
        }
    });

    if (!rentHistory || rentHistory.user_id !== userId) {
        const error = new Error('Rent history not found');
        error.type = 'NotFound';
        throw error;
    }

    const currentDate = new Date().toDateString();
    const dueDate = new Date(rentHistory.end_date).toDateString();

    if (currentDate !== dueDate) {
        const error = new Error('You can only extend a rented book on the due date.');
        error.type = 'InvalidRequest';
        throw error;
    }

    const newEndDate = new Date(rentHistory.end_date);
    newEndDate.setDate(newEndDate.getDate() + 3);

    const updatedRentHistory = await prisma.rent_history.update({
        where: { id: rentHistory.id },
        data: { end_date: newEndDate },
    });

    return updatedRentHistory;
};