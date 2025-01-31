const prisma = require('./prismaClient');

module.exports.retrieveQueueByUserId = async (userId) => {
    try {
        // Fetch queue records for the given user_id
        const queueEntries = await prisma.queue.findMany({
            where: {
                user_id: userId,
            },
            include: {
                book: true, // Include all fields from the book table
            },
            orderBy: {
                created_at: 'desc', // Order queue entries in ascending order
            },
        });

        // Check if any records were found
        if (!queueEntries || queueEntries.length === 0) {
            console.warn(`No queue records found for user_id ${userId}.`);
            return [];
        }

        // Map to return the desired fields
        return queueEntries.map((queue) => ({
            queue_id: queue.id,
            book_id: queue.book.id,
            book_name: queue.book.book_name,
            author: queue.book.author,
            queue_number: queue.queue_number,
            is_next: queue.is_next, // Boolean flag indicating if the user is next
            created_at: queue.created_at,
        }));
    } catch (error) {
        // Log the error details for debugging
        console.error(`Error occurred while retrieving queue records for user_id ${userId}:`, error.message);

        // Throw a detailed error to the caller
        throw new Error(`Failed to retrieve queue records for user_id ${userId} due to a database error.`);
    }
};