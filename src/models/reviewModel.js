const pool = require('../database.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.retrieveReviewsByBookId = (data) => {
    return prisma.review.findMany({
        where: {
            book_id: data.bookId
        },
        include: {
            users: {
                select: {
                    name: true
                }
            }
        }
    })
        .then(reviews => {
            console.log(reviews);
            return reviews;
        })
        .catch(error => {
            console.error(error);
            throw error;
        });
};

module.exports.filterReviews = async (filters) => {
    const whereClause = {
      book_id: filters.bookId,
    };
  
    // Filter by review type (user-specific or all)
    if (filters.reviewType === 'my') {
      whereClause.user_id = filters.userId;
    }
  
    // Filter by rating
    if (filters.rating) {
      whereClause.rating = filters.rating;
    }
  
    // Filter by date range
    if (filters.startDate && filters.endDate) {
      whereClause.posted_on = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }
  
    // Build sorting order
    const orderBy = [];
    if (filters.ratingOrder) {
      orderBy.push({ rating: filters.ratingOrder });
    }
    if (filters.dateOrder) {
      orderBy.push({ posted_on: filters.dateOrder });
    }
  
    try {
      return await prisma.review.findMany({
        where: whereClause,
        orderBy: orderBy.length > 0 ? orderBy : undefined,
        include: {
          users: {
            select: { name: true },
          },
        },
      });
    } catch (error) {
      console.error('Error in filterReviews model:', error);
      throw new Error('Failed to filter reviews.');
    }
  };
  

module.exports.getAverageRatingForBook = (data) => {
    return prisma.review.aggregate({
        where: {
            book_id: data.bookId
        },
        _avg: {
            rating: true
        }
    })
        .then(result => {
            return result._avg.rating;
        })
        .catch(error => {
            console.error(error);
            throw error;
        });
};

module.exports.retrieveReviewsByUserId = async (data) => {
    return prisma.review.findMany({
        where: {
            user_id: data.userId
        },
        include: {
            book: { // Include related book data
                select: {
                    book_name: true, // Only select the book name
                }
            }
        }
    })
        .then(reviews => {
            console.log(reviews); // Logs reviews with book name
            return reviews.map(review => ({
                id: review.id,
                book_id: review.book_id,
                book_name: review.book.book_name, // Include the book name
                rating: review.rating,
                review_text: review.review_text,
                posted_on: review.posted_on
            }));
        })
        .catch(error => {
            console.error(error);
            throw new Error(error.message || "Database query failed");
        });
};



module.exports.checkBookExists = (bookId) => {
    return prisma.book.findUnique({
        where: {
            id: bookId,
        },
    })
        .then((book) => {
            return !!book;
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
};

module.exports.checkRentHistory = (data) => {
    return prisma.rent_history.findFirst({
        where: {
            book_id: data.bookId,
            user_id: data.userId,
        },
    })
        .then(rentHistory => {
            return rentHistory || null;
        })
        .catch(error => {
            console.error(error);
        });
};

module.exports.checkReadStatus = (data) => {
    return prisma.rent_history.findFirst({
        where: {
            book_id: data.bookId,
            user_id: data.userId,
        },
    })
        .then(rentHistory => {
            if (!rentHistory) {
                return { status: "not_read", message: "The user has not read the book." };

            } else if (rentHistory.return_date === null) {
                return { status: "reading", message: "The user is still reading the book." };

            } else {
                return { status: "read", message: "The user has finished reading the book." };

            }
        })
        .catch(error => {
            console.error("Error in checkRentHistory:", error);
            throw error;
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

module.exports.checkReviewOwner = (data) => {
    return prisma.review.findFirst({
        where: {
            id: data.reviewId
        }
    })
        .then(review => {
            return review;
        })
        .catch(error => {
            console.error(error);
        });
};

module.exports.updateReview = (data) => {
    return prisma.review.update({
        where: {
            id: data.reviewId
        },
        data: {
            rating: data.rating,
            review_text: data.reviewText
        }
    })
        .then(updatedReview => {
            return updatedReview;
        })
        .catch(error => {
            console.error("Error in updateReview:", error);
            throw new Error("Failed to update review.");
        });
};

module.exports.deleteReview = (data) => {
    return prisma.review.delete({
        where: {
            id: data.reviewId
        }
    })
        .then(deletedReview => {
            return deletedReview;
        })
        .catch(error => {
            console.error("Error in deleteReview:", error);
            if (error.code === 'P2025') {
                return null;
            }
            throw new Error("Failed to delete the review.");
        });
};