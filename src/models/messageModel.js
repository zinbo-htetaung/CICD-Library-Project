const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.getAllMessages = async (filters = {}) => {
    try {
        const messages = await prisma.message.findMany({
            where: filters,
            include: {
                user: true, // Includes user details if needed
            },
            orderBy: {
                createdAt: 'asc', // Sort by creation time
            },
        });
        return messages;
    } catch (error) {
        console.error('Error retrieving messages:', error);
        throw error;
    }
};

module.exports.getMessageById = async (id) => {
    try {
        const message = await prisma.message.findUnique({
            where: { id },
            include: {
                user: true, // Includes user details if needed
            },
        });

        if (!message) {
            throw new Error(`Message with ID ${id} not found`);
        }

        return message;
    } catch (error) {
        console.error('Error retrieving message by ID:', error);
        throw error;
    }
};

module.exports.createMessage = async (data) => {
    try {
        const newMessage = await prisma.message.create({
            data,
        });
        return newMessage;
    } catch (error) {
        console.error('Error creating message:', error);
        throw error;
    }
};

module.exports.updateMessage = async (id, data) => {
    try {
        const updatedMessage = await prisma.message.update({
            where: { id },
            data,
        });
        return updatedMessage;
    } catch (error) {
        console.error('Error updating message:', error);
        throw error;
    }
};

module.exports.deleteMessage = async (id) => {
    try {
        await prisma.message.delete({
            where: { id },
        });
        return { message: 'Message deleted successfully' };
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
};