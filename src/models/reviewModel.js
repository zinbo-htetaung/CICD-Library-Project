const pool = require('../database.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.retrieveReviewsByBookId = async (data) => {
    return await prisma.review.findMany({
        where: {
            book_id: {
                book_id: data.bookId
            }
        }
    })
        .then(reviews => {
            console.log(reviews)
            return reviews;
        })
        .catch(error => {
            console.error(error);
        });
}

module.exports.checkRentHistory = (data) => {
    return prisma.rent_history.findFirst({
        where: {
            book_id: data.bookId,
            user_id: data.memberId,
        },
    })
        .then(rentHistory => {
            return rentHistory || null;
        })
        .catch(error => {
            console.error(error);
        });
};

module.exports.checkExistingReview = (data) => {
    return prisma.review.findFirst({
        where: {
            book_id: data.bookId,
            user_id: data.userId
        }
    })
        .then(review => {
            if (review) {
                console.log("Review already exists:", review);
                return review;
            }
            return null;
        })
        .catch(error => {
            console.error(error);
        });
};


module.exports.createReview = (data) => {
    return prisma.review.create({
        data: {
            book_id: data.bookId,
            user_id: data.userId,
            rating: data.rating,
            review_text: data.reviewText
        }
    })
        .then(review => {
            console.log("Review created:", review);
            return review;
        })
        .catch(error => {
            console.error(error);
        });
};
