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


module.exports.rentBook = async (data) => {
    const { bookId, userId } = data;

    return await prisma.book.findFirst({
        where: {
            id: bookId
            // no_of_copies: { gt: 0 } (Return null if 0 but want to add a condition below)
        }
    })
    .then((book) => {
        if (!book) {
            throw new Error("Book not available for rent");
        }

        return prisma.user_status.findFirst({
            where: { user_id: userId }
        })
        .then((userStatus) => {
            if (!userStatus) {
                throw new Error("User status not found");
            }

            if (userStatus.reputation < 40) {
                throw new Error("User reputation is too low to rent a book");
            }

            if (book.no_of_copies <= 0) {
                throw new Error("This book is currently out of stock");
            }

            if (userStatus.current_book_count >= userStatus.max_book_count) {
                throw new Error("User has reached the maximum number of rented books");
            }

            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 3);

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
                        due_status: null
                    }
                })
            ]);
        })
        .then(() => {
            return { message: "Book rented successfully", book };
        });
    })
    .catch((error) => {
        console.error(error);
        throw new Error(error.message || "Failed to rent the book");
    });
};

module.exports.return = async (data) => {
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

module.exports.rentBook = async (data) => {
    const { bookId, userId } = data;

    return await prisma.book.findFirst({
        where: {
            id: bookId
            // no_of_copies: { gt: 0 } (Return null if 0 but want to add a condition below)
        }
    })
    .then((book) => {
        if (!book) {
            throw new Error("Book not available for rent");
        }

        return prisma.user_status.findFirst({
            where: { user_id: userId }
        })
        .then((userStatus) => {
            if (!userStatus) {
                throw new Error("User status not found");
            }

            if (userStatus.reputation < 40) {
                throw new Error("User reputation is too low to rent a book");
            }

            if (book.no_of_copies <= 0) {
                throw new Error("This book is currently out of stock");
            }

            if (userStatus.current_book_count >= userStatus.max_book_count) {
                throw new Error("User has reached the maximum number of rented books");
            }

            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 3);

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
                        due_status: null
                    }
                })
            ]);
        })
        .then(() => {
            return { message: "Book rented successfully", book };
        });
    })
    .catch((error) => {
        console.error(error);
        throw new Error(error.message || "Failed to rent the book");
    });
};