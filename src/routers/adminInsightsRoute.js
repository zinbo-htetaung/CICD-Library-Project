const express = require('express');
const router = express.Router();

const adminInsightsController = require('../controller/adminInsightsController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/',jwtMiddleware.verifyToken, adminInsightsController.getAllInsights);


module.exports=router;