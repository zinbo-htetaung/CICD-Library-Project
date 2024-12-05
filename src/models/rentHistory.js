const prisma = require('./prismaClient');

module.exports.retrieveAll = async function retrieveAll(filters) {
    try {
        // Initialize where conditions
        const whereConditions = {};

        // User Filters
        if (filters.userId) whereConditions.userId = parseInt(filters.userId, 10);

        whereConditions.users = {};
        if (filters.userName) {
            whereConditions.users.name = {
                contains: filters.userName,
                mode: 'insensitive'
            };
        }
        if (filters.userEmail) {
            whereConditions.users.email = {
                contains: filters.userEmail,
                mode: 'insensitive'
            };
        }
        if (filters.userAddress) {
            whereConditions.users.address = {
                contains: filters.userAddress,
                mode: 'insensitive'
            };
        }
        if (filters.userDob) {
            whereConditions.users.dob = new Date(filters.userDob);
        }

        // Book Filters
        whereConditions.book = {};
        if (filters.bookId) whereConditions.bookId = parseInt(filters.bookId, 10);

        if (filters.bookName) {
            whereConditions.book.book_name = {
                contains: filters.bookName,
                mode: 'insensitive'
            };
        }
        if (filters.author) {
            whereConditions.book.author = {
                contains: filters.author,
                mode: 'insensitive'
            };
        }
        if (filters.bookDescription) {
            whereConditions.book.description = {
                contains: filters.bookDescription,
                mode: 'insensitive'
            };
        }
        // Add maxNoOfCopies filter
        if (filters.maxNoOfCopies) {
            whereConditions.book.no_of_copies = {
                lte: parseInt(filters.maxNoOfCopies, 10) // Filter for no_of_copies <= maxNoOfCopies
            };
        }

        // Add maxAvailableCopies filter
        if (filters.maxAvailableCopies) {
            whereConditions.book.available_copies = {
                lte: parseInt(filters.maxAvailableCopies, 10) // Filter for available_copies <= maxAvailableCopies
            };
        }

        // Simplified Rental Date Filters
        if (filters.rentalDate) {
            whereConditions.start_date = new Date(filters.rentalDate); // Exact match for rental date
        }
        if (filters.endDate) {
            whereConditions.end_date = new Date(filters.endDate); // Exact match for end date
        }
        if (filters.returnDate) {
            whereConditions.return_date = new Date(filters.returnDate); // Exact match for return date
        }

        // Additional Filters
        if (filters.dueStatus) {
            whereConditions.due_status = filters.dueStatus === "Overdue";
        }

        // Pagination Support
        const limit = 30; // Default limit
        const offset = 0

        // Fetch filtered rental histories
        const [rentHistories, totalCount] = await Promise.all([
            prisma.rent_history.findMany({
                where: whereConditions,
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            address: true,
                            dob: true
                        }
                    },
                    book: {
                        select: {
                            id: true,
                            book_name: true,
                            author: true,
                            description: true,
                            no_of_copies: true,
                            available_copies: true
                        }
                    }
                },
                orderBy: {
                    start_date: filters.sortOrder === 'asc' ? 'asc' : 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.rent_history.count({ where: whereConditions })
        ]);

        // Check if data was found
        if (!rentHistories || rentHistories.length === 0) {
            throw new Error("No rent histories found");
        }

        return {
            data: rentHistories,
            totalItems: totalCount
        };
    } catch (error) {
        console.error("Error retrieving rent histories:", error.message);
        throw new Error("Failed to retrieve rent histories");
    } finally {
        await prisma.$disconnect();
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
        console.log("Successfully retrieved rent history records for user_id ${userId}:, rentHistories");

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

module.exports.retrieveByUserIdIncludingReviewStatus = async (userId) => {
    try {
        const rentHistories = await prisma.rent_history.findMany({
            where: {

                user_id: userId
            },
            include: {
                users: true, // Include user details
                book: {
                    include: {
                        review: {
                            where: {
                                user_id: userId // Include only reviews written by the user
                            }
                        }
                    }
                }
            }

        });

        console.log(`Successfully retrieved rental history and reviews for user_id ${userId}:`, rentHistories);

        if (!rentHistories || rentHistories.length === 0) {
            console.warn(`No rental history records found for user_id ${userId}.`);
            return [];
        }

        return rentHistories;

    } catch (error) {
        console.error(`Error retrieving rental history and reviews for user_id ${userId}:`, error.message);
        throw new Error(`Failed to fetch rental history and reviews due to a database error.`);
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

