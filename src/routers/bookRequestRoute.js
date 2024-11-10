const express = require('express');
const router = express.Router();
const bookRequestController = require('../controller/bookRequestController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/user_id',jwtMiddleware.verifyToken,bookRequestController.retrieveBookRequestByUserId);
router.get('/',bookRequestController.retrieveAllBookRequests);
router.post('/user_id',jwtMiddleware.verifyToken,bookRequestController.createRequestByUserId);
router.delete('/',jwtMiddleware.verifyToken,jwtMiddleware.verifyIsAdmin,bookRequestController.deleteRequestByRequestId);
module.exports=router;