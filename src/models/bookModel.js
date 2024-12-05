const prisma = require('./prismaClient');
///
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
module.exports.returnBook = (data) => {
    const { bookId, userId } = data;
    const today = new Date();

    return prisma.rent_history.findFirst({
        where: {
            book_id: bookId,
            user_id: 1,
            return_date: null // Ensuring this is an active rental
        }
    })
        .then((rentalRecord) => {
            if (!rentalRecord) {
                throw new Error("No active rental record found for this user and book");
            }
            const endDate = rentalRecord.end_date.setHours(23, 59, 0, 0);
            const end_date = (endDate).toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false, // 24-hour format
            });
            const isDue = today >= new Date(end_date);
            console.log(today);
            console.log(end_date);
            const daysOverdue = isDue ? Math.ceil((today - new Date(end_date)) / (1000 * 60 * 60 * 24)) : 0;
            const dueFee = daysOverdue * 5; // $5 per day if overdue

            // Fetch the user status
            return prisma.user_status.findFirst({
                where: { user_id: userId }
            }).then((userStatus) => {
                if (!userStatus) {
                    throw new Error("User status not found");
                }

                // Calculate new reputation based on overdue status
                const reputationAdjustment = isDue ? -5 : 5;
                const newReputation = Math.min(
                    100, // Cap reputation at 100
                    Math.max(0, userStatus.reputation + reputationAdjustment) // Ensure it doesn't go below 0
                );
                console.log("Im new reputation" + newReputation);
                // Dynamically calculate maxBookCount based on reputation
                let dynamicMaxBookCount;
                if (newReputation >= 80) {
                    dynamicMaxBookCount = 4;
                } else if (newReputation >= 70) {
                    dynamicMaxBookCount = 3;
                } else if (newReputation >= 60) {
                    dynamicMaxBookCount = 2;
                } else if (newReputation >= 40) {
                    dynamicMaxBookCount = 0; // If reputation is below 40, no book renting allowed(also handled in rent )
                }
                console.log("Im dynamicMaxBooKCount: " + dynamicMaxBookCount);
                // Adjust current_book_count to ensure it doesn't exceed the new max

                // Start the transaction
                return prisma.$transaction([
                    // Update the rental history to mark the book as returned
                    prisma.rent_history.update({
                        where: {
                            id: rentalRecord.id // Use `id` from `findFirst` result
                        },
                        data: {
                            return_date: today,
                            due_status: isDue ? true : false
                        }
                    }),

                    // Update the book's no_of_copies
                    prisma.book.update({
                        where: { id: bookId },
                        data: { available_copies: { increment: 1 } }
                    }),

                    // Update the user's status
                    prisma.user_status.update({
                        where: { id: userStatus.id },
                        data: {
                            current_book_count: { decrement: 1 },
                            reputation: newReputation,
                            max_book_count: dynamicMaxBookCount
                        }
                    })
                ]).then(() => {
                    // Return the result with due fee information
                    return {
                        message: "Book returned successfully",
                        dueFee: isDue ? `$${dueFee} (Overdue by ${daysOverdue} days)` : "$0 (No overdue)",
                        daysOverdue: daysOverdue,
                        newReputation: newReputation,
                        maxBookCount: dynamicMaxBookCount
                    };
                });
            });
        })
        .catch((error) => {
            console.error(error);
            throw new Error(error.message || "Failed to return the book");
        });
};
module.exports.insertSingle = function insertSingle(data) {
    return prisma.book.create({
        data: {
            book_name: data.book_name,
            author: data.author,
            description: data.description,
            no_of_copies: data.copies,
            available_copies: data.copies
        }
    })
        .then(book => {
            console.log(book);
            return book;
        })
        .catch(error => {
            console.error(error);
        });
};

module.exports.checkBookExists = function checkBookExists(book_name, author) {
    return prisma.book.findFirst({
        where: {
            book_name: book_name,
            author: author
        }
    });
};

module.exports.updateSingle = function updateSingle(data) {
    return prisma.book.update({
        where: {
            id: parseInt(data.id, 10),
        },
        data: {
            book_name: data.book_name,
            author: data.author,
            description: data.description,
            no_of_copies: {
                increment: data.copies      // increment the no_of_copies column 
            },
            available_copies: {
                increment: data.copies      // increment the available_copies column
            }
        }
    })
        .then(book => {
            console.log("Updated book:", book);
            return book;
        })
        .catch(error => {
            if (error.code === 'P2025') {
                throw new Error('Book not found');
            }
            throw error;
        });
};


module.exports.deleteSingle = function deleteSingle(id) {
    return prisma.book.delete({
        where: { id: parseInt(id, 10) }
    })
        .catch(error => {
            if (error.code === 'P2025') {
                throw new Error('Book not found');
            }
            throw error;
        });
};

module.exports.retrieveSingle = function retrieveSingle(id) {
    return prisma.book.findUnique({
        where: {
            id: parseInt(id, 10)
        },
        include: {
            book_category: {
                include: {
                    category: true      // Include the category details
                }
            }
        }
    })
        .then(book => {
            if (!book) {
                throw new Error('Book not found');
            }

            const categoryNames = book.book_category.map(entry => entry.category.category_name);

            return {
                id: book.id,
                book_name: book.book_name,
                author: book.author,
                description: book.description,
                no_of_copies: book.no_of_copies,
                available_copies: book.available_copies,
                categories: categoryNames
            };
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
            if (book.available_copies <= 0) {
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
                    data: { available_copies: { decrement: 1 } }
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
module.exports.attachCategoriesToBook = function attachCategoriesToBook(bookId, categoryIds) {
    const categoryData = categoryIds.map(categoryId => ({
        book_id: bookId,
        category_id: categoryId,
    }));

    return prisma.book_category.createMany({
        data: categoryData,
        skipDuplicates: true,   // avoid duplicate entries
    });
};
module.exports.updateCategories = async function updateCategories(bookId, category_id) {
    const book = await prisma.book.findUnique({
        where: { id: bookId }
    });

    if (!book) {
        throw new Error('Book not found');
    }

    const categoryData = category_id.map(categoryId => ({
        book_id: bookId,
        category_id: categoryId
    }));

    await prisma.book_category.deleteMany({
        where: { book_id: bookId }
    });

    return prisma.book_category.createMany({
        data: categoryData,
        skipDuplicates: true    // prevent duplicate entries
    });
};


