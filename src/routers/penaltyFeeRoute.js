const express = require('express');
const router = express.Router();

const penaltyFeeController = require('../controller/penaltyFeeController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/',jwtMiddleware.verifyToken, penaltyFeeController.retrieveAllUserPenaltyRecords);
router.get('/unpaid',jwtMiddleware.verifyToken, penaltyFeeController.retrieveAllUnpaidPenaltyRecords);
router.get('/paid',jwtMiddleware.verifyToken, penaltyFeeController.retrieveAllPaidPenaltyRecords);
router.get('/all', jwtMiddleware.verifyToken, jwtMiddleware.verifyIsAdmin, penaltyFeeController.retrieveAllPenaltyRecords);
router.post('/filter', jwtMiddleware.verifyToken, jwtMiddleware.verifyIsAdmin, penaltyFeeController.retrieveFilteredPenaltyRecords);
router.get('/:id',jwtMiddleware.verifyToken, penaltyFeeController.retrieveSinglePenaltyRecord);
router.put('/pay',jwtMiddleware.verifyToken, penaltyFeeController.payPenaltyFees);


module.exports=router;