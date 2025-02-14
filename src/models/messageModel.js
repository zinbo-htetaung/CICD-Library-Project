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
    let isRead = false;
    if(data.sender == "admin"){
        isRead = true;
    }
    try {
        const newMessage = await prisma.message.create({
            data: {
                userId: parseInt(data.intUserId), // ✅ Ensure `userId` is an integer
                sender: data.sender,
                message: data.message,
                replyToId: data.replyToId || null,
                isRead: isRead
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

module.exports.markMessagesAsRead = async (userId) => {
    try {
        await prisma.message.updateMany({
            where: { userId, sender: "user", isRead: false },
            data: { isRead: true },
        });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        throw error;
    }
};

module.exports.getLatestMessages = async () => {
    try {
        const latestMessages = await prisma.message.groupBy({
            by: ["userId"],
            _max: { createdAt: true },
            orderBy: { _max: { createdAt: "desc" } },
        });

        const userIds = latestMessages.map(m => m.userId);
        const users = await prisma.users.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
        });

        const messages = await prisma.message.findMany({
            where: { userId: { in: userIds } },
            orderBy: { createdAt: "desc" },
            select: { id: true, userId: true, message: true, createdAt: true, isRead: true },
        });

        return users.map(user => {
            const latestMessage = messages.find(m => m.userId === user.id);
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                lastMessage: latestMessage ? latestMessage.message : "No messages",
                lastMessageTime: latestMessage ? latestMessage.createdAt : null,
                unread: latestMessage ? !latestMessage.isRead : false,
            };
        });
    } catch (error) {
        console.error("Error retrieving latest messages:", error);
        throw error;
    }
};