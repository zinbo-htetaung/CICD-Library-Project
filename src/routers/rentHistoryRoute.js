const express = require('express');
const router = express.Router();
const rentHistoryController = require('../controller/rentHistoryController');

const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/',rentHistoryController.retrieveRentHistory);
// jwtMiddleware.verifyToken 
module.exports = router;
