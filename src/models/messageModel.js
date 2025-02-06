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
    const user = await prisma.users.findMany({ where: { id: data.intUserId } });

    if (!user) {
        throw new Error("User not found!");
    }
    try {
        const newMessage = await prisma.message.create({
            data: {
                userId: parseInt(data.intUserId), // ✅ Ensure `userId` is an integer
                sender: data.sender,
                message: data.message,
                replyToId: data.replyToId || null, // ✅ Ensure `replyToId` is set properly
            }
        });

        return newMessage;
    } catch (error) {
        console.error("Error creating message:", error);
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

module.exports.getMessageByUserId = async (userId) => {
    try {
        const messages = await prisma.message.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" }, // Order messages chronologically
        });
        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
};