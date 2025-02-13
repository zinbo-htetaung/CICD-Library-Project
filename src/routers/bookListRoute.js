const express = require('express');
const router = express.Router();
const bookListController = require('../controller/bookListController.js');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.post('/wishlist/:bookId', jwtMiddleware.verifyToken, bookListController.addToWishlist);
router.post('/ignore/:bookId', jwtMiddleware.verifyToken, bookListController.addToIgnoreList);
router.get('/wishlist/:userId', jwtMiddleware.verifyToken, bookListController.getWishList);
router.get('/ignore/:userId', jwtMiddleware.verifyToken, bookListController.getIgnoreList);
router.delete('/wishlist/:bookId', jwtMiddleware.verifyToken, bookListController.removeFromWishlist);
router.delete('/ignore/:bookId', jwtMiddleware.verifyToken, bookListController.removeFromIgnoreList);

module.exports = router;