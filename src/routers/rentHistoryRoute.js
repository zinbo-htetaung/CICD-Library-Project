const express = require('express');
const router = express.Router();
const rentHistoryController = require('../controller/rentHistoryController');

const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/',rentHistoryController.retrieveRentHistory);
// router.get('/:userId',jwtMiddleware.verifyToken, rentHistoryController.retrieveRentHistoryById);
router.get('/:userId', rentHistoryController.retrieveRentHistoryById);

module.exports = router;
