const model = require('../models/messageModel');

module.exports.getAllMessages = async (req, res) => {
    const filters = req.query; // e.g., { userId: 1, isRead: false }
    try {
        const messages = await model.getAllMessages(filters);
        if (messages.length === 0) {
            return res.status(404).json({ message: 'No messages found' });
        }
        res.status(200).json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.getMessageById = async (req, res) => {
    const { id } = req.params;

    try {
        const message = await model.getMessageById(parseInt(id));
        res.status(200).json({ message });
    } catch (error) {
        console.error('Error retrieving message by ID:', error);
        res.status(404).json({ error: error.message });
    }
};


module.exports.createMessage = async (req, res) => {
    const { userId, sender, message, replyToId } = req.body;

    if (!userId || !sender || !message) {
        return res.status(400).json({ message: 'Required fields are missing' });
    }
    let intUserId = parseInt(userId);
    console.log(intUserId);
    try {
        const newMessage = await model.createMessage({
            intUserId,
            sender,
            message,
            replyToId,
        });
        res.status(201).json({ message: 'Message created successfully', data: newMessage });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.updateMessage = async (req, res) => {
    const { id } = req.params;
    const data = req.body; // Fields to update, e.g., { isRead: true }

    try {
        const updatedMessage = await model.updateMessage(parseInt(id), data);
        res.status(200).json({ message: 'Message updated successfully', data: updatedMessage });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.deleteMessage = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await model.deleteMessage(parseInt(id));
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.getMessageByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const message = await model.getMessageByUserId(parseInt(userId));
        res.status(200).json({ message });
    } catch (error) {
        console.error('Error retrieving message by ID:', error);
        res.status(404).json({ error: error.message });
    }
};