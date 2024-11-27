const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');

const jwtMiddleware = require('../middleware/jwtMiddleware');

router.post('/:bookId', jwtMiddleware.verifyToken, reviewController.checkBookExists, reviewController.checkRentHistory, reviewController.checkExistingReview, reviewController.createReview);
router.get('/:bookId', reviewController.retrieveReviewsByBookId);
router.get('/rating/:bookId', reviewController.getAverageRatingForBook);
router.put('/:reviewId', jwtMiddleware.verifyToken, reviewController.checkReviewOwner, reviewController.updateReview);
router.delete('/:reviewId', jwtMiddleware.verifyToken, reviewController.checkReviewOwner, reviewController.deleteReview);
module.exports=router;