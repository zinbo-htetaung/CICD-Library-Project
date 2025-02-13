const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.addToWishlist = async (data) => {
    try {
        return await prisma.bookWishlist.create({
            data: {
                userId: data.userId,
                bookId: data.bookId
            }
        });
    } catch (error) {
        console.error('Error in addToWishlist:', error);
        throw error;
    }
};

module.exports.addToIgnoreList = async (data) => {
    try {
        return await prisma.bookIgnoreList.create({
            data: {
                userId: data.userId,
                bookId: data.bookId
            }
        });
    } catch (error) {
        console.error('Error in addToIgnoreList:', error);
        throw error;
    }
};

module.exports.removeFromWishlist = async (data) => {
    try {
        return await prisma.bookWishlist.deleteMany({
            where: {
                userId: data.userId,
                bookId: data.bookId
            }
        });
    } catch (error) {
        console.error('Error in removeFromWishlist:', error);
        throw error;
    }
};

module.exports.removeFromIgnoreList = async (data) => {
    try {
        return await prisma.bookIgnoreList.deleteMany({
            where: {
                userId: data.userId,
                bookId: data.bookId
            }
        });
    } catch (error) {
        console.error('Error in removeFromIgnoreList:', error);
        throw error;
    }
};

module.exports.getIgnoredBookIds = async (userId) => {
    try {
        const ignoredBooks = await prisma.bookIgnoreList.findMany({
            where: {
                userId: userId
            },
            select: {
                bookId: true
            }
        });
        return ignoredBooks.map(book => book.bookId);
    } catch (error) {
        console.error('Error in getIgnoredBookIds:', error);
        throw error;
    }
};