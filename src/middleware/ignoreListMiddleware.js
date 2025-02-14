const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.filterIgnoredBooks = async function (req, res, next) {
    try {
        if (res.locals.user_id) {
            const ignoredBooks = await prisma.bookIgnoreList.findMany({
                where: {
                    userId: parseInt(res.locals.user_id)
                },
                select: {
                    bookId: true
                }
            });

            res.locals.ignoredBookIds = ignoredBooks.map(book => book.bookId);
        }
        next();
    } catch (error) {
        console.error('Error in filterIgnoredBooks middleware:', error);
        next(error);
    }
}