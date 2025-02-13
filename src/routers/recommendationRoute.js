const express = require('express');
const router = express.Router();
const recommendationController = require('../controller/recommendationController');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const ignoreListMiddleware = require('../middleware/ignoreListMiddleware');

router.get('/genre-based', jwtMiddleware.verifyToken, ignoreListMiddleware.filterIgnoredBooks, recommendationController.getGenreBasedRecommendations);
router.get('/monthly-popular', recommendationController.getMonthlyPopularBooks);
router.get('/author-based', jwtMiddleware.verifyToken, ignoreListMiddleware.filterIgnoredBooks, recommendationController.getAuthorRecommendations);
module.exports=router;