const express = require('express');
const router = express.Router();
const bookRentalQueueController = require('../controller/bookRentalQueueController.js');
const jwtMiddleware = require('../middleware/jwtMiddleware');
router.get('/admin/mostQueuedBook',bookRentalQueueController.getMostQueuedBooks);
router.get('/admin/mostQueuedGenre',bookRentalQueueController.getMostQueuedGenre);
router.get('/admin/queueTrends',bookRentalQueueController.getQueueTrendsOverTime);
router.get('/:book_id',bookRentalQueueController.retrieveQueueByBookId);
router.get('/',jwtMiddleware.verifyToken,bookRentalQueueController.retrieveQueueByUserId);

router.post('/admin/getAllQueues',bookRentalQueueController.getAllQueues);
router.post('/',jwtMiddleware.verifyToken,bookRentalQueueController.createQueueEntry);

router.delete('/admin',jwtMiddleware.verifyToken,bookRentalQueueController.removeQueueByUserIdAndQueueId);
module.exports=router;