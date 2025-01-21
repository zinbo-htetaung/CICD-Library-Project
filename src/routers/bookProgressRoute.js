const express = require('express');
const router = express.Router();

const bookProgressController = require('../controller/bookProgressController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/', jwtMiddleware.verifyToken, bookProgressController.retrieveAllBookProgress);
router.get('/:id', jwtMiddleware.verifyToken , bookProgressController.retrieveSingleBookProgress);
// router.post('/add', jwtMiddleware.verifyToken, bookProgressController.addBookProgress);
router.put('/update/:id', jwtMiddleware.verifyToken, bookProgressController.checkOwner, bookProgressController.updateBookProgress);
// router.put('/complete/:id', jwtMiddleware.verifyToken, bookProgressController.checkOwner, bookProgressController.completeBookProgress);
// router.put('/reset/:id', jwtMiddleware.verifyToken, bookProgressController.checkOwner, bookProgressController.resetBookProgress);
module.exports=router;