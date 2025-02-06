const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

const jwtMiddleware = require('../middleware/jwtMiddleware');
const bcryptMiddleware = require('../middleware/bcryptMiddleware');

router.post('/register',userController.verifyCaptcha, userController.checkUsernameOrEmailExist, bcryptMiddleware.hashPassword, userController.register);
router.post('/login', userController.login, bcryptMiddleware.comparePassword, jwtMiddleware.generateToken, jwtMiddleware.sendToken);
router.post('/updatePassword',jwtMiddleware.verifyToken, userController.getPassword, userController.compareOldPassword,userController.hashPassword, userController.updatePassword);
router.post('/updateProfile',jwtMiddleware.verifyToken,userController.checkDuplicateEmail,  userController.updateProfileInfo);
router.get('/profile',jwtMiddleware.verifyToken,  userController.getProfileInfo);
router.get('/all', jwtMiddleware.verifyToken, jwtMiddleware.verifyIsAdmin, userController.getAllUsers);
router.delete('/account',jwtMiddleware.verifyToken,  userController.deleteAccount);
router.delete('/ban/:userId', jwtMiddleware.verifyToken, jwtMiddleware.verifyIsAdmin, userController.banUser);
// for retrieve user info in admin chat
router.get('/userId/:userId', jwtMiddleware.verifyToken, jwtMiddleware.verifyIsAdmin, userController.getUserByID);
module.exports = router;