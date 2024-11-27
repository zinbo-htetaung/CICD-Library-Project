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