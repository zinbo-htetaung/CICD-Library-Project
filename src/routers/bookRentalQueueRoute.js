const express = require('express');
const router = express.Router();
const bookRentalQueueController = require('../controller/bookRentalQueueController.js');
const jwtMiddleware = require('../middleware/jwtMiddleware');
router.get('/:book_id',bookRentalQueueController.retrieveQueueByBookId);
router.get('/',jwtMiddleware.verifyToken,bookRentalQueueController.retrieveQueueByUserId);
router.post('/',jwtMiddleware.verifyToken,bookRentalQueueController.createQueueEntry);
router.delete('/',jwtMiddleware.verifyToken,bookRentalQueueController.removeQueueByUserIdAndQueueId);
module.exports=router;