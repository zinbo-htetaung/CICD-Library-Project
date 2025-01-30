const express = require('express');
const router = express.Router();

const bookProgressController = require('../controller/bookProgressController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/', jwtMiddleware.verifyToken, bookProgressController.retrieveAllBookProgress);
router.get('/:id', jwtMiddleware.verifyToken , bookProgressController.checkOwner, bookProgressController.retrieveSingleBookProgress);
router.put('/update/:id', jwtMiddleware.verifyToken, bookProgressController.checkExistence, bookProgressController.checkOwner, bookProgressController.updateBookProgress);
router.put('/complete/:id', jwtMiddleware.verifyToken, bookProgressController.checkExistence, bookProgressController.checkOwner, bookProgressController.completeBookProgress);
router.put('/reset/:id', jwtMiddleware.verifyToken, bookProgressController.checkExistence, bookProgressController.checkOwner, bookProgressController.resetBookProgress);
router.get('/share/:id', jwtMiddleware.verifyToken, bookProgressController.checkExistence, bookProgressController.checkOwner, bookProgressController.checkCompleteProgress);
module.exports=router;