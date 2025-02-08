const express = require('express');
const router = express.Router();

const penaltyFeeController = require('../controller/penaltyFeeController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

// router.get('/',jwtMiddleware.verifyToken, penaltyFeeController.retrieveAllPenaltyRecords);
// router.get('/:penaltyFeeId',jwtMiddleware.verifyToken, penaltyFeeController.retrieveSinglePenaltyRecord);
// router.get('/unpaid',jwtMiddleware.verifyToken, penaltyFeeController.retrieveAllUnpaidPenaltyRecords);
// router.get('/paid',jwtMiddleware.verifyToken, penaltyFeeController.retrieveAllPaidPenaltyRecords);
// router.put('/pay',jwtMiddleware.verifyToken, penaltyFeeController.payPenaltyFees);

module.exports=router;