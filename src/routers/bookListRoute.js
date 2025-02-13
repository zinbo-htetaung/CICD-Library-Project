const express = require('express');
const router = express.Router();
const bookListController = require('../controllers/bookListController');
const auth = require('../middleware/auth');

router.post('/wishlist/:bookId', auth, bookListController.addToWishlist);
router.post('/ignore/:bookId', auth, bookListController.addToIgnoreList);
router.delete('/wishlist/:bookId', auth, bookListController.removeFromWishlist);
router.delete('/ignore/:bookId', auth, bookListController.removeFromIgnoreList);

module.exports = router;