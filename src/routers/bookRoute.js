const express = require('express');
const router = express.Router();
const bookController = require('../controller/bookController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/', bookController.retrieveAllBooks);
router.get('/name/:bookName', bookController.searchBookByName);
router.get('/author/:authorName', bookController.searchBookByAuthor);
router.get('/category/:categoryName', bookController.searchBookByCategory);
router.post('/rent', bookController.rentBook);
router.post('/return', bookController.returnBook);

module.exports = router;