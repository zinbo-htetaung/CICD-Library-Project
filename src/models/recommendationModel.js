const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.getGenreBasedRecommendations = async (data) => {
    try {
        // Get user's reading history
        const userHistory = await prisma.rent_history.findMany({
            where: { user_id: data.userId },
            include: {
                book: {
                    include: {
                        book_category: {
                            include: { category: true }
                        }
                    }
                }
            }
        });

        // Get favorite categories
        const categoryCount = {};
        userHistory.forEach(history => {
            history.book.book_category.forEach(bc => {
                categoryCount[bc.category_id] = (categoryCount[bc.category_id] || 0) + 1;
            });
        });

        const topCategories = Object.entries(categoryCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id]) => parseInt(id));

        // Get recommendations
        return await prisma.book.findMany({
            where: {
                book_category: {
                    some: {
                        category_id: {
                            in: topCategories
                        }
                    }
                },
                NOT: {
                    OR: [
                        {
                            rent_history: {
                                some: {
                                    user_id: data.userId
                                }
                            }
                        },
                        {
                            id: {
                                in: data.ignoredBookIds
                            }
                        }
                    ]
                },
                available_copies: { gt: 0 }
            },
            include: {
                review: true,
                book_category: {
                    include: { category: true }
                }
            },
            take: 10
        });
    } catch (error) {
        console.error('Error in getGenreBasedRecommendations:', error);
        throw error;
    }
};

module.exports.getMonthlyPopularBooks = async () => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        return await prisma.book.findMany({
            where: {
                rent_history: {
                    some: {
                        start_date: {
                            gte: startOfMonth
                        }
                    }
                }
            },
            include: {
                review: true,
                rent_history: {
                    where: {
                        start_date: {
                            gte: startOfMonth
                        }
                    }
                }
            },
            orderBy: {
                rent_history: {
                    _count: 'desc'
                }
            },
            take: 10
        });
    } catch (error) {
        console.error('Error in getMonthlyPopularBooks:', error);
        throw error;
    }
};

module.exports.getAuthorRecommendations = async (data) => {
    try {
        // First get user's highly rated books and their authors
        const userHighRatings = await prisma.review.findMany({
            where: {
                user_id: data.userId,
                rating: { gte: 4 }
            },
            include: {
                book: true
            }
        });

        // Count ratings per author
        const authorCount = {};
        userHighRatings.forEach(review => {
            const author = review.book.author;
            authorCount[author] = (authorCount[author] || 0) + 1;
        });

        // Find authors with 2 or more high ratings
        const favoriteAuthor = Object.entries(authorCount)
            .find(([author, count]) => count >= 2);

        if (!favoriteAuthor) {
            return null; // No authors with 2+ high ratings
        }

        // Get other books by this author
        return await prisma.book.findMany({
            where: {
                author: favoriteAuthor[0],
                NOT: {
                    rent_history: {
                        some: {
                            user_id: data.userId
                        }
                    }
                },
                available_copies: { gt: 0 }
            },
            include: {
                review: true
            },
            take: 10
        });
    } catch (error) {
        console.error('Error in getAuthorRecommendations:', error);
        throw error;
    }
};
module.exports.getMonthlyPopularBooks = async (data = {}) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const whereClause = {
            rent_history: {
                some: {
                    start_date: {
                        gte: startOfMonth
                    }
                }
            }
        };

        // Add ignored books filter if ignoredBookIds exists
        if (data.ignoredBookIds?.length > 0) {
            whereClause.NOT = {
                id: {
                    in: data.ignoredBookIds
                }
            };
        }

        return await prisma.book.findMany({
            where: whereClause,
            include: {
                review: true,
                rent_history: {
                    where: {
                        start_date: {
                            gte: startOfMonth
                        }
                    }
                }
            },
            orderBy: {
                rent_history: {
                    _count: 'desc'
                }
            },
            take: 10
        });
    } catch (error) {
        console.error('Error in getMonthlyPopularBooks:', error);
        throw error;
    }
};

module.exports.getAuthorRecommendations = async (data) => {
    try {
        // First get user's highly rated books and their authors
        const userHighRatings = await prisma.review.findMany({
            where: {
                user_id: data.userId,
                rating: { gte: 4 }
            },
            include: {
                book: true
            }
        });

        // Count ratings per author
        const authorCount = {};
        userHighRatings.forEach(review => {
            const author = review.book.author;
            authorCount[author] = (authorCount[author] || 0) + 1;
        });

        // Find authors with 2 or more high ratings
        const favoriteAuthor = Object.entries(authorCount)
            .find(([author, count]) => count >= 2);

        if (!favoriteAuthor) {
            return null; // No authors with 2+ high ratings
        }

        // Get other books by this author
        return await prisma.book.findMany({
            where: {
                author: favoriteAuthor[0],
                NOT: {
                    OR: [
                        {
                            rent_history: {
                                some: {
                                    user_id: data.userId
                                }
                            }
                        },
                        ...(data.ignoredBookIds?.length > 0 ? [{
                            id: {
                                in: data.ignoredBookIds
                            }
                        }] : [])
                    ]
                },
                available_copies: { gt: 0 }
            },
            include: {
                review: true
            },
            take: 10
        });
    } catch (error) {
        console.error('Error in getAuthorRecommendations:', error);
        throw error;
    }
};