const model = require("../models/reviewModel.js");

module.exports.retrieveReviewsByBookId = (req, res, next) => {
    if (!req.params.bookId) {
        return res.status(400).json({ message: "BookId is not provided." });
    }
    const data = {
        bookId: req.params.bookId
    }
    model.retrieveReviewsByBookId(data)
        .then(reviews => {
            res.json({ reviews: reviews });
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
}

module.exports.checkRentHistory = (req, res, next) => {
    if (!req.params.bookId) {
        return res.status(400).json({ message: "BookId is not provided." });
    }
    const data = {
        bookId: req.params.bookId,
        userId: res.locals.member_id
    }
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
    const data = {
        bookId: req.params.bookId,
        userId: res.locals.member_id
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
    const data = {
        bookId: req.params.bookId,
        userId: res.locals.member_id,
        rating: req.body.rating,
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