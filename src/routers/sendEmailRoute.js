const express = require('express');
const router = express.Router();
const sendEmailController = require('../controller/sendEmailController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.post('/', sendEmailController.sendEmail);


module.exports = router;