const prisma = require('./prismaClient');

module.exports.retrieveAll = (userId) => {
    return prisma.book_progress.findMany({
        where: {
            user_id: userId
        },
        include: {
            book: {
                select: {
                    book_name: true,
                    author: true
                }
            },
            rent_history: {
                select: {
                    start_date: true,
                    end_date: true
                }
            }
        }
    }).then((records) => {
        return records.map((record) => ({
            id: record.id,
            book_name: record.book.book_name,
            rent_history_id : record.rent_history_id,
            book_id: record.book_id,
            author: record.book.author,
            start_date: record.rent_history.start_date,
            end_date: record.rent_history.end_date,
            progress: record.progress,
            status: record.status,
            last_updated: record.last_updated
        }));
    }).catch((error) => {
        console.error("Error fetching book progress: ", error);
        throw new Error("Database query failed.");
    });
};

module.exports.retrieveSingle = (bookProgressId) => {
    return prisma.book_progress.findUnique({
        where: {
            id: bookProgressId
        },
        include: {
            book: {
                select: {
                    book_name: true,
                    author: true
                }
            },
            rent_history: {
                select: {
                    start_date: true,
                    end_date: true
                }
            }
        }
    }).then((record) => {
        if (!record) {
            return null; 
        }
        return {
            id: record.id,
            book_name: record.book.book_name,
            rent_history_id : record.rent_history_id,
            book_id: record.book_id,
            author: record.book.author,
            start_date: record.rent_history.start_date,
            end_date: record.rent_history.end_date,
            progress: record.progress,
            status: record.status,
            last_updated: record.last_updated
        };
    }).catch((error) => {
        console.error("Error fetching book progress :", error);
        throw new Error("Database query failed.");
    });
};

module.exports.checkOwnership = (bookProgressId, userId) => {
    return prisma.book_progress.findFirst({
        where: {
            id: bookProgressId,
            user_id: userId
        }
    }).then((record) => {
        return !!record;    // check existence of record and return boolean
    }).catch((error) => {
        console.error("Error checking ownership:", error);
        throw new Error("Failed to check ownership.");
    });
};

module.exports.checkExistence = (bookProgressId, userId) => {
    return prisma.book_progress.findFirst({
        where: {
            id: bookProgressId,
        }
    }).then((record) => {
        return !!record;    // check existence of record and return boolean
    }).catch((error) => {
        console.error("Error checking book progress record:", error);
        throw new Error("Failed to check book progress record existence.");
    });
};

module.exports.insertSingle = (data) => {
    return prisma.book_progress.create({
        data: {
            rent_history_id: data.rent_history_id,
            book_id: data.book_id,
            user_id: data.user_id,
            status: data.status
        }
    }).catch((error) => {
        console.error("Error inserting book progress:", error);
        throw new Error("Database operation failed.");
    });
};

module.exports.getBookDetails = (bookId) => {
    return prisma.book.findUnique({
        where: { id: bookId },
        select: {
            id: true,
            book_name: true,
            no_of_copies: true,
            available_copies: true
        }
    }).catch((error) => {
        console.error("Error fetching book details:", error);
        throw new Error("Failed to fetch book details.");
    });
};

module.exports.updateProgress = (bookProgressId, progress, status) => {
    return prisma.book_progress.update({
        where: {
            id: bookProgressId
        },
        data: {
            progress,
            status
        }
    }).catch((error) => {
        console.error("Error updating book progress:", error);
        throw new Error("Failed to update book progress.");
    });
};

module.exports.deleteByRentHistoryId = (rentHistoryId) => {
    return prisma.book_progress.deleteMany({
        where: { rent_history_id: rentHistoryId }
    }).catch((error) => {
        console.error(`Error deleting book progress for rent_history_id ${rentHistoryId}:`, error);
        throw new Error("Failed to delete book progress.");
    });
};