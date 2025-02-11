const express = require('express');
const router = express.Router();
const recommendationController = require('../controller/recommendationController');
const jwtMiddleware = require('../middleware/jwtMiddleware');

router.get('/genre', jwtMiddleware.verifyToken, recommendationController.getGenreBasedRecommendations);
router.get('/popular', recommendationController.getMonthlyPopularBooks);
router.get('/author', jwtMiddleware.verifyToken, recommendationController.getAuthorRecommendations);
module.exports=router;