const model = require('../models/bookListModel');

module.exports.addToWishlist = async (req, res) => {
    try {
        const userId = parseInt(res.locals.user_id);
        const bookId = parseInt(req.params.bookId);

        if (!userId || !bookId) {
            return res.status(400).json({ message: "Invalid user ID or book ID" });
        }

        await model.addToWishlist({ userId, bookId });
        res.status(200).json({ message: "Book added to wishlist successfully" });
    } catch (error) {
        console.error('Error in addToWishlist controller:', error);
        res.status(500).json({ message: "Failed to add book to wishlist" });
    }
};

module.exports.addToIgnoreList = async (req, res) => {
    try {
        const userId = parseInt(res.locals.user_id);
        const bookId = parseInt(req.params.bookId);

        if (!userId || !bookId) {
            return res.status(400).json({ message: "Invalid user ID or book ID" });
        }

        await model.addToIgnoreList({ userId, bookId });
        res.status(200).json({ message: "Book added to ignore list successfully" });
    } catch (error) {
        console.error('Error in addToIgnoreList controller:', error);
        res.status(500).json({ message: "Failed to add book to ignore list" });
    }
};

module.exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = parseInt(res.locals.user_id);
        const bookId = parseInt(req.params.bookId);

        if (!userId || !bookId) {
            return res.status(400).json({ message: "Invalid user ID or book ID" });
        }

        await model.removeFromWishlist({ userId, bookId });
        res.status(200).json({ message: "Book removed from wishlist successfully" });
    } catch (error) {
        console.error('Error in removeFromWishlist controller:', error);
        res.status(500).json({ message: "Failed to remove book from wishlist" });
    }
};

module.exports.removeFromIgnoreList = async (req, res) => {
    try {
        const userId = parseInt(res.locals.user_id);
        const bookId = parseInt(req.params.bookId);

        if (!userId || !bookId) {
            return res.status(400).json({ message: "Invalid user ID or book ID" });
        }

        await model.removeFromIgnoreList({ userId, bookId });
        res.status(200).json({ message: "Book removed from ignore list successfully" });
    } catch (error) {
        console.error('Error in removeFromIgnoreList controller:', error);
        res.status(500).json({ message: "Failed to remove book from ignore list" });
    }
};