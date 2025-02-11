const express = require('express');
const router = express.Router();
const recommendationController = require('../controller/recommendationController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/genre-based', jwtMiddleware.verifyToken, recommendationController.getGenreBasedRecommendations);
router.get('/monthly-popular', recommendationController.getMonthlyPopularBooks);
router.get('/author-based', jwtMiddleware.verifyToken, recommendationController.getAuthorRecommendations);
module.exports=router;