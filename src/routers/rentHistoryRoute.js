const express = require('express');
const router = express.Router();
const rentHistoryController = require('../controller/rentHistoryController');

const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/',rentHistoryController.retrieveRentHistory);
router.get('/user',jwtMiddleware.verifyToken, rentHistoryController.retrieveRentHistoryById);
router.get('/user/review',jwtMiddleware.verifyToken, rentHistoryController.retrieveRentHistoryByIdIncludingReviewHistory);
router.put('/extend/:historyId',jwtMiddleware.verifyToken, rentHistoryController.extendBookRental);

module.exports = router;
