const prisma = require('./prismaClient');

module.exports.retrieveAll = async () => {
    return await prisma.book.findMany()
        .then(books => {
            console.log(books)
            return books;
        })
        .catch(error => {
            console.error(error);

        });
}
module.exports.searchByName = async (data) => {
    return await prisma.book.findMany({
        where: {
            book_name: {
                contains: data.bookName,
                mode: 'insensitive'
            }
        }
    })
        .then(books => {
            console.log(books)
            return books;
        })
        .catch(error => {
            console.error(error);

        });
}

module.exports.searchByAuthor = async (data) => {
    return await prisma.book.findMany({
        where: {
            author: {
                contains: data.authorName,
                mode: 'insensitive'
            }
        }
    })
        .then(books => {
            console.log(books)
            return books;
        })
        .catch(error => {
            console.error(error);

        });
}

module.exports.searchByCategory = async (data) => {
    return await prisma.book.findMany({
        where: {
            book_category: {
                some: {
                    category: {
                        category_name: {
                            contains: data.categoryName,
                            mode: 'insensitive'
                        }
                    }
                }
            }
        },
        include: {
            book_category: {
                include: {
                    category: true
                }
            }
        }
    })
        .then(books => {
            console.log(books)
            return books;
        })
        .catch(error => {
            console.error(error);

        });
}

module.exports.rentBook = (data) => {
    const { bookId, userId } = data;

    return prisma.book.findFirst({
        where: {
            id: bookId
        }
    })
        .then((book) => {
            if (!book) {
                throw new Error("Book not available for rent");
            }

            // Check if the book is out of stock
            if (book.no_of_copies <= 0) {
                throw new Error("This book is currently out of stock");
            }

            // Check if the user has already rented this book and has not returned it
            return prisma.rent_history.findFirst({
                where: {
                    book_id: bookId,
                    user_id: userId,
                    return_date: null  // Indicates the book has not been returned yet
                }
            });
        })
        .then((existingRental) => {
            if (existingRental) {
                throw new Error("User has already rented this book and has not returned it");
            }

            // Check user status
            return prisma.user_status.findFirst({
                where: { user_id: userId }
            });
        })
        .then((userStatus) => {
            if (!userStatus) {
                throw new Error("User status not found");
            }

            if (userStatus.reputation < 40) {
                throw new Error("User reputation is too low to rent a book");
            }

            if (userStatus.current_book_count >= userStatus.max_book_count) {
                throw new Error("User has reached the maximum number of rented books");
            }

            // Calculate start_date and end_date
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 3);

            // Rent the book by updating the database records in a transaction
            return prisma.$transaction([
                prisma.user_status.update({
                    where: { id: userStatus.id },
                    data: { current_book_count: { increment: 1 } }
                }),
                prisma.book.update({
                    where: { id: bookId },
                    data: { no_of_copies: { decrement: 1 } }
                }),
                prisma.rent_history.create({
                    data: {
                        book_id: bookId,
                        user_id: userId,
                        start_date: startDate,
                        end_date: endDate,
                        return_date: null,
                        due_status: false
                    }
                })
            ]);
        })
        .then(() => {
            // Fetch the updated book data with the latest `no_of_copies`
            return prisma.book.findUnique({
                where: { id: bookId },
                select: {
                    id: true,
                    book_name: true,
                    no_of_copies: true,
                    available_copies: true
                }
            });
        })
        .then((updatedBook) => {
            return { message: "Book rented successfully", book: updatedBook };
        })
        .catch((error) => {
            console.error(error);
            throw new Error(error.message || "Failed to rent the book");
        });
};

module.exports.returnBook = (data) => {
    const { bookId, userId } = data;
    const today = new Date();

    return prisma.rent_history.findFirst({
        where: {
            book_id: bookId,
            user_id: userId,
            return_date: null  // Ensuring this is an active rental
        }
    })
        .then((rentalRecord) => {
            if (!rentalRecord) {
                throw new Error("No active rental record found for this user and book");
            }

            const isDue = today > new Date(rentalRecord.end_date);
            const daysOverdue = isDue ? Math.ceil((today - new Date(rentalRecord.end_date)) / (1000 * 60 * 60 * 24)) : 0;
            const dueFee = daysOverdue * 5;  // $5 per day if overdue

            // Fetch the user status
            return prisma.user_status.findFirst({
                where: { user_id: userId }
            })
                .then((userStatus) => {
                    if (!userStatus) {
                        throw new Error("User status not found");
                    }

                    // Start the transaction
                    return prisma.$transaction([
                        // Update the rental history using the primary key `id`
                        prisma.rent_history.update({
                            where: {
                                id: rentalRecord.id  // Use `id` from `findFirst` result
                            },
                            data: {
                                return_date: today,
                                due_status: isDue ? true : false
                            }
                        }),

                        // Update the book's no_of_copies
                        prisma.book.update({
                            where: { id: bookId },
                            data: { no_of_copies: { increment: 1 } }
                        }),

                        // Update the user status based on whether the book is overdue or not
                        prisma.user_status.update({
                            where: { id: userStatus.id },
                            data: {
                                current_book_count: { decrement: 1 },
                                reputation: { increment: isDue ? -5 : 5 },
                                max_book_count: {
                                    increment: isDue ? -1 : (userStatus.max_book_count < 5 ? 1 : 0)
                                }
                            }
                        })
                    ]).then(() => {
                        // Return the result with due fee information if overdue
                        return {
                            message: "Book returned successfully",
                            dueFee: isDue ? `$${dueFee} (Overdue by ${daysOverdue} days)` : "$0 (No overdue)"
                        };
                    });
                });
        })
        .catch((error) => {
            console.error(error);
            throw new Error(error.message || "Failed to return the book");
        });
};