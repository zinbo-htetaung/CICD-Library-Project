const prisma = require('./prismaClient');
const notificationModel = require("../models/notificationModel");

module.exports.createQueueEntry = async (userId, bookId) => {
    try {
        // Check if the user is currently renting the book
        const activeRental = await prisma.rent_history.findFirst({
            where: {
                user_id: userId,
                book_id: bookId,
                return_date: null
            }
        });

        if (activeRental) {
            throw new Error(`User is currently renting this book and cannot join the queue.`);
        }

        // Check if the user is already in the queue
        const existingEntry = await prisma.queue.findFirst({
            where: { user_id: userId, book_id: bookId },
        });

        if (existingEntry) {
            throw new Error(`User is already in the queue for this book.`);
        }

        // Find the highest queue_number for the given book_id
        const lastQueueEntry = await prisma.queue.findFirst({
            where: { book_id: bookId },
            orderBy: { queue_number: 'desc' },
        });

        // Determine the new queue number
        const newQueueNumber = lastQueueEntry ? lastQueueEntry.queue_number + 1 : 1;

        // ✅ Create the queue entry
        const queueEntry = await prisma.queue.create({
            data: {
                user_id: userId,
                book_id: bookId,
                queue_number: newQueueNumber,
                is_next: newQueueNumber === 1,
            }
        }); 
        console.log(queueEntry.id,)
        console.log(userId)
        console.log(bookId)

        // ✅ Add the entry to QueueHistory
        await prisma.queueHistory.create({
            data: {
                queue_id: queueEntry.id,
                user_id: userId,
                book_id: bookId,
                status: "Pending",
            }
        });

        return {
            message: "Queue entry created successfully.",
            queue: queueEntry,
        };
    } catch (error) {
        throw new Error(error.message);
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

        // ✅ Update QueueHistory status to "Cancelled" before deleting
        await prisma.queueHistory.updateMany({
            where: {
                queue_id: queueId,
                status: "Pending",
            },
            data: {
                status: "Cancelled",
                timestamp: new Date(),
            },
        });

        console.log(`✅ Updated QueueHistory status to "Cancelled" for queue_id ${queueId}.`);

        // ✅ Nullify `queue_id` in QueueHistory before deleting the queue entry
        await prisma.queueHistory.updateMany({
            where: { queue_id: queueId },
            data: { queue_id: null },
        });

        console.log(`✅ QueueHistory records updated to prevent foreign key constraint issue.`);

        // ✅ Delete the queue entry
        await prisma.queue.delete({ where: { id: queueId } });

        console.log(`✅ Removed queue entry with queue_id ${queueId} for user_id ${userId}.`);

        // ✅ Shift queue numbers for remaining users in the queue
        await prisma.queue.updateMany({
            where: {
                book_id: book_id,
                queue_number: { gt: queue_number },
            },
            data: {
                queue_number: { decrement: 1 }, // Shift queue numbers up by 1
            },
        });

        console.log(`✅ Updated queue numbers for users in book_id ${book_id} queue after removal.`);

        // ✅ Set `is_next` to false for all users first
        await prisma.queue.updateMany({
            where: { book_id: book_id },
            data: { is_next: false },
        });

        // ✅ Find the new first user in queue and set `is_next` to `true`
        const firstInQueue = await prisma.queue.findFirst({
            where: { book_id: book_id },
            orderBy: { queue_number: "asc" },
        });

        if (firstInQueue) {
            await prisma.queue.update({
                where: { id: firstInQueue.id },
                data: { is_next: true },
            });
            console.log(`✅ User with queue_number 1 is now next: user_id ${firstInQueue.user_id}`);
        } else {
            console.log(`✅ No users left in queue for book_id ${book_id}`);
        }

        // ✅ Fetch updated queue for notification
        const updatedQueue = await prisma.queue.findMany({
            where: { book_id: book_id },
            orderBy: { queue_number: "asc" },
            select: { user_id: true, queue_number: true },
        });

        // ✅ Get book details for notifications
        const book = await prisma.book.findUnique({
            where: { id: book_id },
            select: { book_name: true },
        });

        // ✅ Send notifications to remaining users in queue
        for (const user of updatedQueue) {
            const isNext = user.queue_number === 1;
            let message = `Your queue position for "${book.book_name}" is now #${user.queue_number}.`;

            if (isNext) {
                message += ` You are next in line! Please be ready to borrow the book. 📖`;
            }

            await notificationModel.createNotification(user.user_id, "Queue Position Updated", message);
        }

        return { message: "Queue record successfully removed, positions updated, and users notified." };

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
                users: true, // Include user details
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
            user_id: queue.users.id,
            user_name: queue.users.name,
            queue_number: queue.queue_number,
            is_next: queue.is_next, // Boolean flag indicating if the user is next
            created_at: queue.created_at,
        }));
    } catch (error) {
        console.error(`Error occurred while retrieving queue records for book_id ${bookId}:`, error.message);
        throw new Error(`Failed to retrieve queue records for book_id ${bookId} due to a database error.`);
    }
};

module.exports.getAllQueues = async (status = "", bookTitle = "", userName = "", sortBy = "timestamp", sortOrder = "asc") => {
    try {
        return await prisma.queueHistory.findMany({
            where: {
                // Only filter by status if provided
                ...(status ? { status: { equals: status } } : {}),

                // Only filter by book title if a bookTitle is provided
                ...(bookTitle ? {
                    book: { book_name: { contains: bookTitle, mode: "insensitive" } }
                } : {}),

                // Only filter by user name if a userName is provided
                ...(userName ? {
                    users: { name: { contains: userName, mode: "insensitive" } }
                } : {}),
            },
            select: {
                id: true,
                queue_id: true, // Queue ID reference
                status: true,
                timestamp: true, // Sorting field
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                book: {
                    select: {
                        id: true,
                        book_name: true,
                        author: true,
                    },
                },
                queue: {
                    select: {
                        queue_number: true,
                        created_at: true, // Sorting field
                    },
                },
            },
            orderBy: {
                // Sorting dynamically based on the input
                ...(sortBy === "queue_number" ? { queue: { queue_number: sortOrder } } : {}),
                ...(sortBy === "book_name" ? { book: { book_name: sortOrder } } : {}),
                ...(sortBy === "user_name" ? { users: { name: sortOrder } } : {}),
                ...(sortBy === "created_at" ? { queue: { created_at: sortOrder } } : {}),
                ...(sortBy === "timestamp" ? { timestamp: sortOrder } : {}), // Sorting by history timestamp
            },
        });
    } catch (error) {
        console.error("Error fetching queue history:", error.message);
        throw error;
    }
};

module.exports.getMostQueuedBooks = async (limit) => {
    try {
        // Step 1: Group queue history entries by book_id and count occurrences
        const queuedBooks = await prisma.queueHistory.groupBy({
            by: ['book_id'],
            _count: {
                book_id: true // Count how many times each book appears in queue history
            },
            orderBy: {
                _count: {
                    book_id: 'desc' // Sort by most queued books
                }
            },
            take: limit, // Limit results to top books
        });

        // Step 2: Fetch book details for each book_id
        const bookIds = queuedBooks.map(q => q.book_id); // Extract book IDs

        const books = await prisma.book.findMany({
            where: { id: { in: bookIds } },
            select: {
                id: true,
                book_name: true,
                author: true
            }
        });

        // Step 3: Merge queue counts with book details
        const result = queuedBooks.map(queue => {
            const bookDetails = books.find(book => book.id === queue.book_id);
            return {
                book_id: queue.book_id,
                book_name: bookDetails?.book_name || "Unknown",
                author: bookDetails?.author || "Unknown",
                queue_count: queue._count.book_id
            };
        });

        return result;
    } catch (error) {
        console.error("Error fetching most queued books from history:", error.message);
        throw error;
    }
};

module.exports.getMostQueuedGenre = async () => {
    try {
        // Step 1: Group queue history entries by book_id and count occurrences
        const queueCounts = await prisma.queueHistory.groupBy({
            by: ["book_id"],
            _count: {
                id: true // Count how many times each book appears in the queue history
            },
            orderBy: {
                _count: {
                    id: "desc" // Sort by highest queue count
                }
            }
        });

        // Step 2: Fetch book categories (genres) for the grouped book_ids
        const bookIds = queueCounts.map(q => q.book_id);
        const books = await prisma.book.findMany({
            where: { id: { in: bookIds } },
            select: {
                id: true,
                book_category: {
                    select: {
                        category: {
                            select: {
                                category_name: true
                            }
                        }
                    }
                }
            }
        });

        // Step 3: Merge genre data with queue counts
        const genreQueueCounts = {};
        queueCounts.forEach(queue => {
            const bookDetails = books.find(book => book.id === queue.book_id);
            const genres = bookDetails?.book_category?.map(cat => cat.category.category_name) || ["Unknown"];

            genres.forEach(genre => {
                genreQueueCounts[genre] = (genreQueueCounts[genre] || 0) + queue._count.id;
            });
        });

        // Step 4: Convert object to sorted array and return top 10 genres
        const sortedGenres = Object.entries(genreQueueCounts)
            .map(([genre, count]) => ({ genre, queue_count: count }))
            .sort((a, b) => b.queue_count - a.queue_count) // Sort in descending order
            .slice(0, 10); // Get top 10 genres

        return sortedGenres;
    } catch (error) {
        console.error("Error fetching most queued genres from history:", error.message);
        throw error;
    }
};


module.exports.getQueueTrendsOverTime = async (interval = "month") => {
    try {
        const queueTrends = await prisma.queueHistory.groupBy({
            by: ["timestamp", "book_id"],
            _count: { id: true }, // Count number of queues per genre
            orderBy: { timestamp: "asc" } // Order by earliest date first
        });

        // Fetch book categories (genres) for each book_id
        const bookIds = queueTrends.map(q => q.book_id);
        const books = await prisma.book.findMany({
            where: { id: { in: bookIds } },
            select: {
                id: true,
                book_category: {
                    select: {
                        category: {
                            select: { category_name: true }
                        }
                    }
                }
            }
        });

        // Merge queue data with genres
        const formattedTrends = queueTrends.map(queue => {
            const book = books.find(book => book.id === queue.book_id);
            const genres = book?.book_category?.map(c => c.category.category_name) || ["Unknown"];
            return {
                interval: new Date(queue.timestamp).toISOString().substring(0, 7), // Format: YYYY-MM
                genre: genres.join(", "),
                queue_count: queue._count.id
            };
        });

        return formattedTrends;
    } catch (error) {
        console.error("Error fetching queue trends over time from history:", error.message);
        throw error;
    }
};
