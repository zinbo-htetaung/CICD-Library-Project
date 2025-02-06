const express = require('express');
const router = express.Router();

const penaltyFeeController = require('../controller/penaltyFeeController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

// router.get('/',jwtMiddleware.verifyToken, penaltyFeeController.retrieveAllPenaltyFees);
// router.get('/:penaltyFeeId',jwtMiddleware.verifyToken, penaltyFeeController.retrieveSinglePenaltyFee);
// router.get('/unpaid',jwtMiddleware.verifyToken, penaltyFeeController.retrieveAllUnpaidPenaltyFees);
// router.get('/paid',jwtMiddleware.verifyToken, penaltyFeeController.retrieveAllPaidPenaltyFees);
// router.put('/pay',jwtMiddleware.verifyToken, penaltyFeeController.payPenaltyFee);

module.exports=router;