const express = require('express');
const router = express.Router();
const controller = require('../controller/messageController');
const jwtMiddleware = require('../middleware/jwtMiddleware');


// Get all messages (with optional filters)
router.get('/', jwtMiddleware.verifyToken, controller.getAllMessages);
// Retrieve a message by ID
router.get('/:id', jwtMiddleware.verifyToken, controller.getMessageById);
// Create a new message
router.post('/', jwtMiddleware.verifyToken, controller.createMessage);
// Update a message (e.g., mark as read)
router.put('/:id', jwtMiddleware.verifyToken, controller.updateMessage);
// Delete a message
router.delete('/:id', jwtMiddleware.verifyToken, controller.deleteMessage);
// Get messages by user ID
router.get('/user/:userId', jwtMiddleware.verifyToken, controller.getMessageByUserId);

router.get('/users/latestMessages', jwtMiddleware.verifyToken, controller.getLatestMessages);

router.post('/markRead/:userId', jwtMiddleware.verifyToken, controller.markRead);

module.exports = router;