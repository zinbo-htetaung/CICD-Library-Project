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
                user_id: userId // Filter by user_id
            },
            include: {
                users: true, // Include all fields from the users table
                book: true   // Include all fields from the book table
            }
        });

        // Log the fetched records for debugging purposes
        console.log(`Successfully retrieved rent history records for user_id ${userId}:`, rentHistories);

        // Check if any records were found
        if (!rentHistories || rentHistories.length === 0) {
            console.warn(`No rental history records found for user_id ${userId}.`);
            return [];
        }

        // Return the full rent histories
        return rentHistories;
    } catch (error) {
        // Log the error details for debugging
        console.error(`Error occurred while retrieving rent histories for user_id ${userId}:`, error.message);

        // Throw a detailed error to the caller
        throw new Error(`Failed to retrieve rent histories for user_id ${userId} due to a database error.`);
    }
};