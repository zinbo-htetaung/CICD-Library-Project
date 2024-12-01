const model = require("../models/reviewModel.js");

module.exports.retrieveReviewsByBookId = (req, res, next) => {
    if (!req.params.bookId) {
        return res.status(400).json({ message: "BookId is not provided." });
    }

    const bookId = parseInt(req.params.bookId, 10);

    const data = {
        bookId: bookId
    };

    model.retrieveReviewsByBookId(data)
        .then(reviews => {
            const formattedReviews = reviews.map(review => ({
                id: review.id,
                book_id: review.book_id,
                user_id: review.user_id,
                rating: review.rating,
                review_text: review.review_text,
                posted_on: review.posted_on,
                review_owner: review.users.name
            }));

            res.json({ reviews: formattedReviews });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
};

module.exports.getAverageRatingForBook = (req, res, next) => {
    if (!req.params.bookId) {
        return res.status(400).json({ message: "BookId is not provided." });
    }

    if (isNaN(req.params.bookId)) {
        console.log(req.params.bookId);
        return res.status(400).json({ message: "Provided BookId is not an integer." });
    }

    const bookId = parseInt(req.params.bookId, 10);

    const data = {
        bookId: bookId
    };

    model.getAverageRatingForBook(data)
        .then(averageRating => {
            res.json({ averageRating: averageRating || 0 });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
};

module.exports.retrieveReviewsByUserId = (req, res, next) => {
    res.locals.user_id = 1; // Simulated user ID for example
    const userId = res.locals.user_id;

    if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
    }

    const data = { userId: parseInt(userId, 10) };

    model.retrieveReviewsByUserId(data)
        .then(reviews => {
            if (reviews.length === 0) {
                return res.status(404).json({ message: "No reviews found for this user" });
            }
            res.json({ reviews });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
};


module.exports.checkBookExists = (req, res, next) => {
    if (!req.params.bookId) {
        return res.status(400).json({ message: "BookId is not provided." });
    }

    const bookId = parseInt(req.params.bookId);

    model.checkBookExists(bookId)
        .then((bookExists) => {
            if (!bookExists) {
                return res.status(404).json({ message: "Book does not exist." });
            }
            next();
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
};

module.exports.checkRentHistory = (req, res, next) => {
    if (!req.params.bookId) {
        return res.status(400).json({ message: "BookId is not provided." });
    }

    console.log(res.locals.user_id);

    const bookId = parseInt(req.params.bookId, 10);
    const userId = parseInt(res.locals.user_id, 10);

    if (isNaN(bookId) || isNaN(userId)) {
        throw new Error("Invalid bookId or userId; both should be valid integers.");
    }

    const data = {
        bookId: bookId,
        userId: userId
    };

    model.checkRentHistory(data)
        .then(rentHistory => {
            if (!rentHistory) {
                return res.status(403).json({ message: "You need to rent and read the book before being allowed to review it." });
            }

            next();
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
}

module.exports.checkExistingReview = (req, res, next) => {
    const bookId = parseInt(req.params.bookId, 10);
    const userId = parseInt(res.locals.user_id, 10);

    if (isNaN(bookId) || isNaN(userId)) {
        throw new Error("Invalid bookId or userId; both should be valid integers.");
    }

    const data = {
        bookId: bookId,
        userId: userId
    };

    model.checkExistingReview(data)
        .then(review => {
            if (review) {
                return res.status(403).json({ message: "You have already reviewed this book." });
            }
            next();
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
};

module.exports.createReview = (req, res, next) => {
    if (!req.params.bookId || !req.body.rating || !req.body.reviewText) {
        return res.status(400).json({ message: "Data is not provided fully." });
    }

    const bookId = parseInt(req.params.bookId, 10);
    const userId = parseInt(res.locals.user_id, 10);
    const rating = parseInt(req.body.rating, 10);

    if (isNaN(bookId) || isNaN(rating)) {
        throw new Error("Invalid bookId or rating; both should be valid integers.");
    }

    if (rating > 5 || rating < 0) {
        throw new Error ("Rating Out of Range. It should be between 0 and 5.");
    }

    const data = {
        bookId: bookId,
        userId: userId,
        rating: rating,
        reviewText: req.body.reviewText
    }
    model.createReview(data)
        .then(createdReview => {
            res.status(201).json({ review: createdReview });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
}

module.exports.checkReviewOwner = (req, res, next) => {
    const reviewId = parseInt(req.params.reviewId, 10);
    const userId = parseInt(res.locals.user_id, 10);

    if (isNaN(reviewId) || isNaN(userId)) {
        throw new Error("Invalid reviewId or userId; both should be valid integers.");
    }

    const data = {
        reviewId: reviewId,
        userId: userId
    };

    model.checkReviewOwner(data)
        .then(review => {
            if (!review) {
                return res.status(404).json({ message: "Review not found." });
            }
            if (review.user_id !== data.userId) {
                return res.status(403).json({ message: "You do not have permission to modify this review." });
            }
            next();
        })
        .catch(error => {
            console.error("Error checking review ownership:", error);
            return res.status(500).json({ error: error.message });
        });
};


module.exports.updateReview = (req, res, next) => {
    if (!req.body.rating || !req.body.reviewText) {
        return res.status(400).json({ message: "Rating and review text are required." });
    }

    const reviewId = parseInt(req.params.reviewId, 10);
    const rating = parseInt(req.body.rating, 10);

    console.log(reviewId);
    console.log(rating);

    if (isNaN(reviewId) || isNaN(rating)) {
        throw new Error("Invalid reviewId or rating; both should be valid integers.");
    }

    const data = {
        reviewId: reviewId,
        rating: rating,
        reviewText: req.body.reviewText
    };

    model.updateReview(data)
        .then(updatedReview => {
            res.json({ message: "Review updated successfully", review: updatedReview });
        })
        .catch(error => {
            console.error("Error updating review:", error);
            return res.status(500).json({ error: error.message });
        });
};

module.exports.deleteReview = (req, res) => {
    const reviewId = parseInt(req.params.reviewId, 10);

    const data = {
        reviewId: reviewId
    };

    model.deleteReview(data)
        .then(deletedReview => {
            if (!deletedReview) {
                return res.status(404).json({ message: "Review not found." });
            }
            return res.status(200).json({ message: "Review deleted successfully." });
        })
        .catch(error => {
            console.error("Error deleting review:", error);
            return res.status(500).json({ error: error.message });
        });
};