const express = require('express');
const router = express.Router();
const bookRentalQueueController = require('../controller/bookRentalQueueController.js');
const jwtMiddleware = require('../middleware/jwtMiddleware');
router.get('/admin/mostQueuedBook',jwtMiddleware.verifyToken,jwtMiddleware.verifyIsAdmin,bookRentalQueueController.getMostQueuedBooks);
router.get('/admin/mostQueuedGenre',jwtMiddleware.verifyToken,jwtMiddleware.verifyIsAdmin,bookRentalQueueController.getMostQueuedGenre);
router.get('/admin/queueTrends',jwtMiddleware.verifyToken,jwtMiddleware.verifyIsAdmin, bookRentalQueueController.getQueueTrendsOverTime);
router.get('/:book_id',bookRentalQueueController.retrieveQueueByBookId);
router.get('/',jwtMiddleware.verifyToken,bookRentalQueueController.retrieveQueueByUserId);

router.post('/admin/getAllQueues',jwtMiddleware.verifyToken,jwtMiddleware.verifyIsAdmin, bookRentalQueueController.getAllQueues);
router.post('/',jwtMiddleware.verifyToken,bookRentalQueueController.createQueueEntry);

router.delete('/admin',jwtMiddleware.verifyToken,bookRentalQueueController.removeQueueByUserIdAndQueueId);
module.exports=router;