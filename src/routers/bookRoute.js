const express = require('express');
const router = express.Router();

const bookController = require('../controller/bookController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/',bookController.retrieveAllBooks);
router.get('/name/:bookName',bookController.searchBookByName);
router.get('/author/:authorName',bookController.searchBookByAuthor);
router.get('/category/:categoryName',bookController.searchBookByCategory);
router.post('/add', jwtMiddleware.verifyToken, jwtMiddleware.verifyIsAdmin, bookController.checkIfBookExists, bookController.addBook, bookController.attachCategories);
router.put('/update/category/:bookId', jwtMiddleware.verifyToken, jwtMiddleware.verifyIsAdmin, bookController.updateBookCategories);
router.put('/update/:bookId',jwtMiddleware.verifyToken, jwtMiddleware.verifyIsAdmin, bookController.updateBook);
router.delete('/delete/:bookId',jwtMiddleware.verifyToken, jwtMiddleware.verifyIsAdmin, bookController.deleteBook);
router.get('/:bookId', bookController.retrieveSingleBook);
router.post('/rent',jwtMiddleware.verifyToken, bookController.rentBook);
router.post('/return/:bookId', bookController.returnBook);
// to add jwtMiddleware.verifyToken for return route
module.exports=router;

