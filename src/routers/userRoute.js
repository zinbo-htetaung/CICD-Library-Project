const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

const jwtMiddleware = require('../middleware/jwtMiddleware');
const bcryptMiddleware = require('../middleware/bcryptMiddleware');

router.post('/register',userController.verifyCaptcha, userController.checkUsernameOrEmailExist, bcryptMiddleware.hashPassword, userController.register, userController.addUserStatus);
router.post('/login', userController.login, bcryptMiddleware.comparePassword, jwtMiddleware.generateToken, jwtMiddleware.sendToken);
router.post('/updatePassword', userController.getPassword, userController.compareOldPassword,userController.hashPassword, userController.updatePassword);
router.post('/updateProfile',  userController.updateProfileInfo);
router.get('/profile',  userController.getProfileInfo);
router.get('/all', jwtMiddleware.verifyToken, jwtMiddleware.verifyIsAdmin, userController.getAllUsers);
router.delete('/account',  userController.deleteAccount);
//removed jwtMiddleware.verifyToken, for testing
module.exports = router;