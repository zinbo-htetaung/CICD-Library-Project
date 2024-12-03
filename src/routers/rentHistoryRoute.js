const express = require('express');
const router = express.Router();
const rentHistoryController = require('../controller/rentHistoryController');

const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/',rentHistoryController.retrieveRentHistory);
router.get('/user',jwtMiddleware.verifyToken, rentHistoryController.retrieveRentHistoryById);

module.exports = router;
