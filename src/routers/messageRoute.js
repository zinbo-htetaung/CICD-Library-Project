const express = require('express');
const router = express.Router();
const controller = require('../controller/messageController');
const jwtMiddleware = require('../middleware/jwtMiddleware');


// Get all messages (with optional filters)
router.get('/', controller.getAllMessages);
// Retrieve a message by ID
router.get('/:id', controller.getMessageById);
// Create a new message
router.post('/', controller.createMessage);
// Update a message (e.g., mark as read)
router.put('/:id', controller.updateMessage);
// Delete a message
router.delete('/:id', controller.deleteMessage);
// Get messages by user ID
router.get('/user/:userId', controller.getMessageByUserId);

router.get('/users/latestMessages', controller.getLatestMessages);

router.post('/markRead/:userId', controller.markRead);

module.exports = router;