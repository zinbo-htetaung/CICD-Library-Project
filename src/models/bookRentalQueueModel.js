const prisma = require('./prismaClient');

module.exports.createQueueEntry = async (userId, bookId) => {
    try {
        // Find the highest queue_number for the given book_id
        const lastQueueEntry = await prisma.queue.findFirst({
            where: { book_id: bookId },
            orderBy: { queue_number: 'desc' }, // Get the last position in the queue
        });

        // Determine the new queue number (next available slot)
        const newQueueNumber = lastQueueEntry ? lastQueueEntry.queue_number + 1 : 1;

        // Check if the user is already in the queue for this book
        const existingEntry = await prisma.queue.findFirst({
            where: { user_id: userId, book_id: bookId },
        });

        if (existingEntry) {
            console.warn(`User ${userId} is already in the queue for book ${bookId}.`);
            throw new Error(`User is already in the queue for this book.`);
        }

        // Create the queue entry
        const newQueueEntry = await prisma.queue.create({
            data: {
                user_id: userId,
                book_id: bookId,
                queue_number: newQueueNumber,
                is_next: newQueueNumber === 1, // First person in queue is marked as next
            },
        });

        console.log(`Successfully added user_id ${userId} to the queue for book_id ${bookId} at position ${newQueueNumber}.`);

        return {
            message: "Queue entry created successfully.",
            queue: newQueueEntry,
        };
    } catch (error) {
        console.error(`Error occurred while creating queue entry for user_id ${userId} and book_id ${bookId}:`, error.message);
        throw new Error(`Failed to create queue entry due to a database error.`);
    }
};

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

module.exports.removeQueueByUserIdAndQueueId = async (userId, queueId) => {
    try {
        // Fetch the queue entry to be deleted
        const queueEntry = await prisma.queue.findUnique({
            where: {
                id: queueId,
                user_id: userId,
            },
        });

        if (!queueEntry) {
            console.warn(`No queue record found for user_id ${userId} with queue_id ${queueId}.`);
            throw new Error("No matching queue record found.");
        }

        const { queue_number, book_id } = queueEntry; // Get queue number and book_id for shifting logic

        // Delete the queue entry
        await prisma.queue.delete({
            where: { id: queueId },
        });

        console.log(`Removed queue entry with queue_id ${queueId} for user_id ${userId}.`);

        // Shift queue numbers for remaining users in the queue
        await prisma.queue.updateMany({
            where: {
                book_id: book_id,
                queue_number: { gt: queue_number }, // Update only those with higher queue numbers
            },
            data: {
                queue_number: {
                    decrement: 1, // Shift queue numbers up by 1
                },
            },
        });

        console.log(`Updated queue numbers for users in book_id ${book_id} queue after removal.`);
        return { message: "Queue record successfully removed and positions updated." };
    } catch (error) {
        console.error(`Error removing queue record for user_id ${userId} and queue_id ${queueId}:`, error.message);
        throw new Error(`Failed to remove queue record and update queue numbers due to a database error.`);
    }
};

module.exports.retrieveQueueByBookId = async (bookId) => {
    try {
        // Fetch queue records for the given book_id
        const queueEntries = await prisma.queue.findMany({
            where: { book_id: bookId },
            include: {
                user: true, // Include user details
            },
            orderBy: {
                queue_number: 'asc', // Order by queue position
            },
        });

        // Check if any records were found
        if (!queueEntries || queueEntries.length === 0) {
            console.warn(`No queue records found for book_id ${bookId}.`);
            return [];
        }

        // Map to return the desired fields
        return queueEntries.map((queue) => ({
            queue_id: queue.id,
            user_id: queue.user.id,
            user_name: queue.user.name,
            queue_number: queue.queue_number,
            is_next: queue.is_next, // Boolean flag indicating if the user is next
            created_at: queue.created_at,
        }));
    } catch (error) {
        console.error(`Error occurred while retrieving queue records for book_id ${bookId}:`, error.message);
        throw new Error(`Failed to retrieve queue records for book_id ${bookId} due to a database error.`);
    }
};
