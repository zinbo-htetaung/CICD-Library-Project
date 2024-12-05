const prisma = require('./prismaClient');

module.exports.getBooksWithCategories = async () => {
    try {
        const books = await prisma.book.findMany({
            include: {
                book_category: {
                    include: {
                        category: true,
                    },
                },
            },
        });
        return books.map(book => ({
            id: book.id,
            name: book.book_name,
            author: book.author,
            categories: book.book_category.map(bc => bc.category.category_name),
            availableCopies: book.available_copies,
        }));
    } catch (error) {
        console.error('Error fetching books with categories:', error);
        throw error;
    }
};

module.exports.getRentalHistory = async () => {
    try {
        const rentals = await prisma.rent_history.findMany({
            include: {
                book: true,
                users: true,
            },
        });
        return rentals.map(rental => ({
            bookName: rental.book.book_name,
            userName: rental.users.name,
            startDate: rental.start_date,
            endDate: rental.end_date,
            returnDate: rental.return_date,
            dueStatus: rental.due_status,
        }));
    } catch (error) {
        console.error('Error fetching rental history:', error);
        throw error;
    }
};

module.exports.getTopRentedBooks = async () => {
    try {
        const topBooks = await prisma.rent_history.groupBy({
            by: ['book_id'],
            _count: { book_id: true },
            orderBy: { _count: { book_id: 'desc' } },
            take: 5,
        });

        const detailedBooks = await Promise.all(
            topBooks.map(async book => {
                const bookDetails = await prisma.book.findUnique({
                    where: { id: book.book_id },
                });
                return {
                    bookName: bookDetails.book_name,
                    author: bookDetails.author,
                    rentCount: book._count.book_id,
                };
            })
        );

        return detailedBooks;
    } catch (error) {
        console.error('Error fetching top rented books:', error);
        throw error;
    }
};

module.exports.getTopUsersByRentals = async () => {
    try {
        const topUsers = await prisma.rent_history.groupBy({
            by: ['user_id'],
            _count: { user_id: true },
            orderBy: { _count: { user_id: 'desc' } },
            take: 5,
        });

        const detailedUsers = await Promise.all(
            topUsers.map(async user => {
                const userDetails = await prisma.users.findUnique({
                    where: { id: user.user_id },
                });
                return {
                    userName: userDetails.name,
                    email: userDetails.email,
                    rentCount: user._count.user_id,
                };
            })
        );

        return detailedUsers;
    } catch (error) {
        console.error('Error fetching top users by rentals:', error);
        throw error;
    }
};

module.exports.retrieveAll = async () => {
    try {
        const books = await module.exports.getBooksWithCategories();
        const rentals = await module.exports.getRentalHistory();
        const topBooks = await module.exports.getTopRentedBooks();
        const topUsers = await module.exports.getTopUsersByRentals();

        // Yearly Rentals
        const yearlyRentals = rentals.reduce((acc, rental) => {
            const year = rental.startDate.getFullYear();
            acc[year] = (acc[year] || 0) + 1;
            return acc;
        }, {});

        // Monthly Rentals grouped by year
        const monthlyRentalsByYear = rentals.reduce((acc, rental) => {
            const year = rental.startDate.getFullYear();
            const month = rental.startDate.getMonth() + 1;

            acc[year] = acc[year] || {};
            acc[year][month] = (acc[year][month] || 0) + 1;

            return acc;
        }, {});

        // Transform monthlyRentalsByYear to an array format
        const monthlyRentals = Object.entries(monthlyRentalsByYear).map(([year, months]) => ({
            year: parseInt(year),
            months: Object.keys(months).map(Number),
            rentals: Object.values(months),
        }));

        return {
            booksByCategory: {
                categories: books.flatMap(book => book.categories),
                counts: books.map(book => book.availableCopies),
            },
            yearlyRentals: {
                years: Object.keys(yearlyRentals).map(Number),
                counts: Object.values(yearlyRentals),
            },
            monthlyRentals,
            topRentedBooks: {
                books: topBooks.map(book => book.bookName),
                rentals: topBooks.map(book => book.rentCount),
            },
            maxRentalsByUser: {
                users: topUsers.map(user => user.userName),
                rentals: topUsers.map(user => user.rentCount),
            },
        };
    } catch (error) {
        console.error('Error fetching insights:', error);
        throw error;
    }
};